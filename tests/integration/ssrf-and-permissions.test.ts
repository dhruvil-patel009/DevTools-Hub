import { describe, expect, it } from 'vitest';
import { isPrivateOrReservedIp, validateProxyUrlSyntax } from '@/lib/security/ssrf';
import { canAccessAdminPanel, canManageAdminRoles } from '@/server/permissions/rbac';

describe('SSRF Protection', () => {
  it('blocks private, loopback, link-local, and cloud metadata IPs', () => {
    expect(isPrivateOrReservedIp('127.0.0.1')).toBe(true);
    expect(isPrivateOrReservedIp('10.0.0.5')).toBe(true);
    expect(isPrivateOrReservedIp('172.16.0.1')).toBe(true);
    expect(isPrivateOrReservedIp('192.168.1.1')).toBe(true);
    expect(isPrivateOrReservedIp('169.254.169.254')).toBe(true);
    expect(isPrivateOrReservedIp('::1')).toBe(true);
    expect(isPrivateOrReservedIp('fe80::1')).toBe(true);
    expect(isPrivateOrReservedIp('::ffff:127.0.0.1')).toBe(true);

    expect(isPrivateOrReservedIp('93.184.216.34')).toBe(false);
    expect(isPrivateOrReservedIp('1.1.1.1')).toBe(false);
  });

  it('blocks localhost, internal hostnames, and non-HTTP protocols', () => {
    expect(validateProxyUrlSyntax('http://localhost:3000/api').ok).toBe(false);
    expect(validateProxyUrlSyntax('http://metadata.google.internal/computeMetadata').ok).toBe(false);
    expect(validateProxyUrlSyntax('file:///etc/passwd').ok).toBe(false);
    expect(validateProxyUrlSyntax('ftp://example.com').ok).toBe(false);
    expect(validateProxyUrlSyntax('https://user:pass@example.com').ok).toBe(false);

    expect(validateProxyUrlSyntax('https://api.github.com/zen').ok).toBe(true);
  });
});

describe('RBAC Permission Helpers', () => {
  it('restricts admin panel access to ADMIN and SUPER_ADMIN', () => {
    expect(canAccessAdminPanel('USER')).toBe(false);
    expect(canAccessAdminPanel('ADMIN')).toBe(true);
    expect(canAccessAdminPanel('SUPER_ADMIN')).toBe(true);
  });

  it('restricts admin role management strictly to SUPER_ADMIN', () => {
    expect(canManageAdminRoles('USER')).toBe(false);
    expect(canManageAdminRoles('ADMIN')).toBe(false);
    expect(canManageAdminRoles('SUPER_ADMIN')).toBe(true);
  });
});
