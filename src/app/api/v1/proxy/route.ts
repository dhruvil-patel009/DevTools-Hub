import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/server/permissions/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { validateProxyDestination } from '@/lib/security/ssrf';
import { apiError, apiSuccess, handleUnexpectedError } from '@/server/http/response';

const proxySchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']),
  url: z.string().url().max(2000),
  headers: z.record(z.string()).default({}),
  body: z.string().max(100_000).optional(),
});

const MAX_RESPONSE_BYTES = 1024 * 1024; // 1 MB
const TIMEOUT_MS = 8000;

export async function POST(request: NextRequest) {
  try {
    const authRes = await requireAuth();
    if ('error' in authRes) return authRes.error;

    const rl = await checkRateLimit(`proxy:${authRes.actor.id}`, {
      limit: 30,
      windowSeconds: 60,
    });
    if (!rl.allowed) {
      return apiError('RATE_LIMITED', 'Proxy rate limit exceeded.', 429);
    }

    const raw = await request.json();
    const parsed = proxySchema.safeParse(raw);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', 'Invalid proxy request payload.', 400);
    }

    const destCheck = await validateProxyDestination(parsed.data.url);
    if (!destCheck.ok) {
      return apiError('SSRF_BLOCKED', destCheck.reason, 403);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const start = Date.now();

    try {
      const upstream = await fetch(destCheck.url.toString(), {
        method: parsed.data.method,
        headers: parsed.data.headers,
        body:
          !['GET', 'HEAD'].includes(parsed.data.method) && parsed.data.body
            ? parsed.data.body
            : undefined,
        redirect: 'manual', // Prevent open-redirect SSRF bypasses
        signal: controller.signal,
      });

      if (upstream.status >= 300 && upstream.status < 400) {
        return apiError(
          'REDIRECT_BLOCKED',
          `Upstream returned redirect (${upstream.status}); redirects are disabled in proxy mode for SSRF safety.`,
          400
        );
      }

      const buf = await upstream.arrayBuffer();
      if (buf.byteLength > MAX_RESPONSE_BYTES) {
        return apiError('RESPONSE_TOO_LARGE', 'Upstream response exceeded 1 MB proxy limit.', 413);
      }

      const text = new TextDecoder('utf-8', { fatal: false }).decode(buf);
      return apiSuccess({
        status: upstream.status,
        statusText: upstream.statusText,
        durationMs: Date.now() - start,
        headers: Array.from(upstream.headers.entries()),
        body: text,
      });
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return apiError('UPSTREAM_TIMEOUT', 'Upstream request timed out after 8 seconds.', 504);
    }
    return handleUnexpectedError(err, 'POST /api/v1/proxy');
  }
}
