/**
 * TravelMateNE Sliding-Window In-Memory Rate Limiter
 * 20 requests per 60 seconds per client IP
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up stale IP records every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const cutoff = now - 60000;
    rateLimitStore.forEach((record, key) => {
      const valid = record.timestamps.filter((ts) => ts > cutoff);
      if (valid.length === 0) {
        rateLimitStore.delete(key);
      } else {
        record.timestamps = valid;
      }
    });
  }, 300000);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
  limit: number;
}

/**
 * Extracts client IP from incoming Next.js / standard Request headers.
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('fastly-client-ip') ||
    '127.0.0.1'
  );
}

/**
 * Evaluates rate limit against sliding window.
 * Default: 20 requests per 60,000 ms (60 seconds)
 */
export function checkRateLimit(
  clientIp: string,
  limit: number = 20,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  let record = rateLimitStore.get(clientIp);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(clientIp, record);
  }

  // Filter out timestamps older than the sliding window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const resetInMs = Math.max(0, oldest + windowMs - now);
    return {
      allowed: false,
      remaining: 0,
      resetInMs,
      limit,
    };
  }

  // Record this request
  record.timestamps.push(now);
  const remaining = Math.max(0, limit - record.timestamps.length);
  const resetInMs = windowMs;

  return {
    allowed: true,
    remaining,
    resetInMs,
    limit,
  };
}

/**
 * Formats rate limit information into standard HTTP headers.
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const resetSeconds = Math.ceil(result.resetInMs / 1000);
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil((Date.now() + result.resetInMs) / 1000)),
  };

  if (!result.allowed) {
    headers['Retry-After'] = String(resetSeconds);
  }

  return headers;
}
