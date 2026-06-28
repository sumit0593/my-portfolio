import { LRUCache } from "lru-cache";

interface RateLimiterOptions {
  interval: number;      // Time window in milliseconds
  uniqueTokenPerInterval: number;  // Max unique tokens to track
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  limit: number;
}

interface RateLimitRecord {
  count: number;
  expiresAt: number;
}

/**
 * Creates an in-memory rate limiter using LRU cache.
 * Each token (e.g., IP address) is tracked independently.
 * Uses a fixed-window strategy to prevent sliding-window lock-outs.
 */
export function createRateLimiter(options: RateLimiterOptions) {
  const cache = new LRUCache<string, RateLimitRecord>({
    max: options.uniqueTokenPerInterval,
  });

  return {
    /**
     * Check if a request from the given token is within the rate limit.
     * @param limit - Maximum requests allowed in the time window
     * @param token - Unique identifier (e.g., IP address or user ID)
     */
    check(limit: number, token: string): RateLimitResult {
      const now = Date.now();
      let record = cache.get(token);

      if (!record || now > record.expiresAt) {
        record = {
          count: 0,
          expiresAt: now + options.interval,
        };
      }

      const updatedCount = record.count + 1;
      const remainingTTL = Math.max(0, record.expiresAt - now);

      cache.set(
        token,
        { count: updatedCount, expiresAt: record.expiresAt },
        { ttl: remainingTTL }
      );

      return {
        success: updatedCount <= limit,
        remaining: Math.max(0, limit - updatedCount),
        limit,
      };
    },
  };
}

// Pre-configured rate limiters for different endpoints
export const chatLimiter = createRateLimiter({
  interval: 60 * 1000,        // 1 minute window
  uniqueTokenPerInterval: 500,
});

export const contactLimiter = createRateLimiter({
  interval: 60 * 60 * 1000,   // 1 hour window
  uniqueTokenPerInterval: 500,
});

export const analyzeLimiter = createRateLimiter({
  interval: 60 * 1000,        // 1 minute window
  uniqueTokenPerInterval: 500,
});

export const embedLimiter = createRateLimiter({
  interval: 60 * 60 * 1000,   // 1 hour window
  uniqueTokenPerInterval: 100,
});

export const searchLimiter = createRateLimiter({
  interval: 60 * 1000,        // 1 minute window
  uniqueTokenPerInterval: 500,
});

/**
 * Extract a rate-limiting token from the request.
 * Uses X-Forwarded-For (Vercel), falling back to a default.
 */
export function getRateLimitToken(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "anonymous";
}
