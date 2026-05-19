// Tiny in-memory rate limiter, keyed by client IP. Enough for form-spam
// throttling on a single-process app — no external store, no dependency.

const hits = new Map(); // key -> array of timestamps (ms)

// Returns true if the key is allowed, false if it has exceeded `max` requests
// within `windowMs`. Allowed requests are recorded.
export function rateLimit(key, { max = 5, windowMs = 10 * 60 * 1000 } = {}) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

// Drops timestamps older than an hour so the map cannot grow unbounded.
setInterval(
  () => {
    const cutoff = Date.now() - 60 * 60 * 1000;
    for (const [key, times] of hits) {
      const kept = times.filter((t) => t > cutoff);
      if (kept.length) hits.set(key, kept);
      else hits.delete(key);
    }
  },
  15 * 60 * 1000,
).unref();
