/**
 * Edge-compatible in-memory sliding window rate limiter.
 *
 * Limits are per-instance (each Vercel edge instance has its own Map),
 * which provides effective protection against single-source brute force.
 * For global distributed rate limiting, add Upstash Redis or Vercel KV.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Periodically evict stale entries to prevent memory growth
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  const cutoff = now - windowMs;
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

/**
 * Check if a request should be rate limited.
 * @returns { limited: true, retryAfter } if blocked, { limited: false } if allowed.
 */
export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): { limited: true; retryAfter: number } | { limited: false } {
  cleanup(windowMs);

  const now = Date.now();
  const cutoff = now - windowMs;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfter = Math.ceil((oldestInWindow + windowMs - now) / 1000);
    return { limited: true, retryAfter };
  }

  entry.timestamps.push(now);
  return { limited: false };
}
