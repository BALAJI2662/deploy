const { Redis } = require('@upstash/redis');
const { Ratelimit } = require('@upstash/ratelimit');

const hasUpstashCredentials = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

// Keep this module server-only. Never import it from the Vite frontend.
const redis = hasUpstashCredentials ? Redis.fromEnv() : null;

const createRateLimiter = (requests, window) => {
    if (!redis) return null;

    return new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(requests, window),
        prefix: 'cms:ratelimit',
        analytics: false,
    });
};

module.exports = {
    redis,
    hasUpstashCredentials,
    authRateLimiter: createRateLimiter(10, '10 m'),
    publicRateLimiter: createRateLimiter(120, '1 m'),
};
