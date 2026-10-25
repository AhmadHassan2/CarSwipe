import "server-only";

/**
 * Fixed-window in-memory rate limiter. Good enough for a single Node process;
 * swap for Redis/Upstash when running multiple instances.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export type RateLimitResult = { ok: boolean; remaining: number; retryAfter: number };

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 10_000) sweep(now);
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }
  bucket.count += 1;
  const ok = bucket.count <= limit;
  return {
    ok,
    remaining: Math.max(0, limit - bucket.count),
    retryAfter: ok ? 0 : Math.ceil((bucket.resetAt - now) / 1000),
  };
}

function sweep(now: number) {
  for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
}

export const LIMITS = {
  login: [10, 15 * 60_000],
  signup: [5, 60 * 60_000],
  message: [30, 60_000],
  upload: [40, 10 * 60_000],
  report: [10, 60 * 60_000],
  review: [10, 60 * 60_000],
  swipe: [120, 60_000],
  password: [5, 15 * 60_000],
} as const satisfies Record<string, readonly [number, number]>;

export function limit(kind: keyof typeof LIMITS, id: string) {
  const [max, windowMs] = LIMITS[kind];
  return rateLimit(`${kind}:${id}`, max, windowMs);
}

/** Disable limits in automated tests so suites don't trip over each other. */
export function rateLimitsEnabled() {
  return process.env.DISABLE_RATE_LIMITS !== "true";
}
