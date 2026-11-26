import dns from 'dns/promises';
import net from 'net';

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'ip6-localhost',
  'ip6-loopback',
  'metadata.google.internal',
  'metadata',
]);

export function isPrivateOrReservedIp(ip: string): boolean {
  // Handle IPv4-mapped IPv6 like ::ffff:127.0.0.1
  const normalized = ip.startsWith('::ffff:') ? ip.slice(7) : ip;

  if (net.isIPv4(normalized)) {
    const parts = normalized.split('.').map(Number);
    if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return true;
    const [a, b] = parts as [number, number, number, number];

    if (a === 0) return true; // 0.0.0.0/8
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 CGNAT
    if (a === 127) return true; // 127.0.0.0/8 loopback
    if (a === 169 && b === 254) return true; // 169.254.0.0/16 link-local & cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a >= 224) return true; // multicast & reserved
    return false;
  }

  if (net.isIPv6(normalized)) {
    const lower = normalized.toLowerCase();
    if (lower === '::' || lower === '::1') return true;
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // ULA fc00::/7
    if (lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb')) {
      return true; // fe80::/10 link-local
    }
    if (lower.startsWith('ff')) return true; // multicast
    return false;
  }

  return true;
}

export function validateProxyUrlSyntax(rawUrl: string):
  | { ok: true; url: URL }
  | { ok: false; reason: string } {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { ok: false, reason: 'Invalid URL format.' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, reason: 'Only http and https protocols are allowed.' };
  }

  if (parsed.username || parsed.password) {
    return { ok: false, reason: 'Embedded URL credentials are not allowed.' };
  }

  const host = parsed.hostname.toLowerCase();
  if (
    BLOCKED_HOSTNAMES.has(host) ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.internal')
  ) {
    return { ok: false, reason: 'Target hostname is blocked by SSRF policy.' };
  }

  if (net.isIP(host) && isPrivateOrReservedIp(host)) {
    return { ok: false, reason: 'Private or reserved IP addresses are blocked.' };
  }

  return { ok: true, url: parsed };
}

export async function validateProxyDestination(rawUrl: string): Promise<
  { ok: true; url: URL } | { ok: false; reason: string }
> {
  const syntax = validateProxyUrlSyntax(rawUrl);
  if (!syntax.ok) return syntax;

  const host = syntax.url.hostname;
  if (net.isIP(host)) {
    return syntax;
  }

  try {
    const records = await dns.lookup(host, { all: true });
    if (records.length === 0) {
      return { ok: false, reason: 'Hostname could not be resolved.' };
    }
    for (const rec of records) {
      if (isPrivateOrReservedIp(rec.address)) {
        return { ok: false, reason: 'Resolved IP address is private or reserved.' };
      }
    }
    return syntax;
  } catch {
    return { ok: false, reason: 'DNS resolution failed for target host.' };
  }
}
