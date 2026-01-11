/**
 * Rate limiting using Redis
 * Implements sliding window rate limiting for API endpoints
 */

import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyPrefix?: string; // Optional prefix for Redis keys
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}

/**
 * Check rate limit using sliding window algorithm
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { windowMs, maxRequests, keyPrefix = "rl" } = config;
  const key = `${keyPrefix}:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  try {
    // Use Redis pipeline for atomic operations
    const pipeline = redis.pipeline();

    // Remove old entries outside the window
    pipeline.zremrangebyscore(key, 0, windowStart);

    // Count requests in current window
    pipeline.zcard(key);

    // Add current request
    pipeline.zadd(key, now, `${now}-${Math.random()}`);

    // Set expiry
    pipeline.expire(key, Math.ceil(windowMs / 1000));

    const results = await pipeline.exec();

    if (!results) {
      throw new Error("Pipeline execution failed");
    }

    // Get count before adding current request
    const count = (results[1][1] as number) || 0;

    const allowed = count < maxRequests;
    const remaining = Math.max(0, maxRequests - count - 1);
    const resetAt = new Date(now + windowMs);

    if (!allowed) {
      // If not allowed, remove the request we just added
      await redis.zrem(key, `${now}-${Math.random()}`);

      return {
        allowed: false,
        remaining: 0,
        resetAt,
        retryAfter: Math.ceil(windowMs / 1000)
      };
    }

    return {
      allowed: true,
      remaining,
      resetAt
    };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    // Fail open on Redis errors to avoid blocking legitimate traffic
    return {
      allowed: true,
      remaining: maxRequests,
      resetAt: new Date(now + windowMs)
    };
  }
}

/**
 * Get identifier from request (IP or user ID)
 */
export function getIdentifier(req: Request): string {
  // Try to get user/session identifier first
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    return `user:${authHeader.slice(0, 32)}`; // Use first 32 chars of auth token
  }

  // Fall back to IP address
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return `ip:${ip}`;
}

/**
 * Rate limit configurations for different endpoint types
 */
export const RATE_LIMITS = {
  // High-frequency tracking endpoints
  tracking: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    keyPrefix: "rl:track"
  },

  // Conversion endpoints (less frequent)
  conversions: {
    windowMs: 60 * 1000,
    maxRequests: 30,
    keyPrefix: "rl:conv"
  },

  // Admin endpoints (strict)
  admin: {
    windowMs: 60 * 1000,
    maxRequests: 60,
    keyPrefix: "rl:admin"
  },

  // Public API (moderate)
  public: {
    windowMs: 60 * 1000,
    maxRequests: 100,
    keyPrefix: "rl:public"
  },

  // Auth endpoints (very strict to prevent brute force)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyPrefix: "rl:auth"
  }
} as const;

/**
 * Middleware helper for Next.js API routes
 */
export async function withRateLimit(
  req: Request,
  config: RateLimitConfig
): Promise<Response | null> {
  const identifier = getIdentifier(req);
  const result = await checkRateLimit(identifier, config);

  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Rate limit exceeded",
        retryAfter: result.retryAfter
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(result.retryAfter || 60),
          "X-RateLimit-Limit": String(config.maxRequests),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": result.resetAt.toISOString()
        }
      }
    );
  }

  return null; // Allowed, continue processing
}
