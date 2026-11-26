import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { isRedisConfigured } from '@/config/env';

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

interface MemoryBucket {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, MemoryBucket>();

function checkMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const existing = memoryStore.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    memoryStore.set(key, { count: 1, resetAt });
    return { allowed: true, limit, remaining: Math.max(0, limit - 1), resetAt };
  }

  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);
  return {
    allowed: existing.count <= limit,
    limit,
    remaining,
    resetAt: existing.resetAt,
  };
}

let upstashLimiterCache: Map<string, Ratelimit> | null = null;

function getUpstashLimiter(limit: number, windowSeconds: number): Ratelimit | null {
  if (!isRedisConfigured()) return null;
  if (!upstashLimiterCache) upstashLimiterCache = new Map();

  const cacheKey = `${limit}:${windowSeconds}`;
  const existing = upstashLimiterCache.get(cacheKey);
  if (existing) return existing;

  const redis = new Redis({
    url: process.env.REDIS_URL!,
    token: process.env.REDIS_TOKEN!,
  });

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
    analytics: false,
  });

  upstashLimiterCache.set(cacheKey, limiter);
  return limiter;
}

export async function checkRateLimit(
  identifier: string,
  options: { limit?: number; windowSeconds?: number } = {}
): Promise<RateLimitResult> {
  const limit = options.limit ?? 60;
  const windowSeconds = options.windowSeconds ?? 60;

  const upstash = getUpstashLimiter(limit, windowSeconds);
  if (upstash) {
    try {
      const res = await upstash.limit(identifier);
      return {
        allowed: res.success,
        limit: res.limit,
        remaining: res.remaining,
        resetAt: res.reset,
      };
    } catch {
      // Fall back to in-memory limiter if Redis is temporarily unreachable
    }
  }

  return checkMemoryRateLimit(identifier, limit, windowSeconds * 1000);
}

export function resetMemoryRateLimits(): void {
  memoryStore.clear();
}
