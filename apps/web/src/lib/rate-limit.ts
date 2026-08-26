import { redis } from "@/server/redis";

interface RateLimitResult {
  readonly success: boolean;
  readonly limit: number;
  readonly remaining: number;
  readonly reset: number;
}

// In-memory fallback tracker if Redis is temporarily unreachable
const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowSeconds: number = 60,
): Promise<RateLimitResult> {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const reset = Math.floor((now + windowSeconds * 1000) / 1000);

  try {
    const pipeline = redis.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, windowSeconds);

    const results = await pipeline.exec();
    const currentCount = (results?.[0]?.[1] as number) ?? 1;

    const remaining = Math.max(0, maxRequests - currentCount);
    const success = currentCount <= maxRequests;

    return {
      success,
      limit: maxRequests,
      remaining,
      reset,
    };
  } catch {
    // Graceful fallback to in-memory store
    const record = inMemoryStore.get(key);

    if (!record || record.resetAt <= now) {
      inMemoryStore.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - 1,
        reset,
      };
    }

    record.count += 1;
    const remaining = Math.max(0, maxRequests - record.count);
    const success = record.count <= maxRequests;

    return {
      success,
      limit: maxRequests,
      remaining,
      reset: Math.floor(record.resetAt / 1000),
    };
  }
}
