const { redis, hasUpstashCredentials } = require('../Utils/lib/upstash');

const rateLimit = (limiter, namespace) => async (req, res, next) => {
    if (!limiter) return next();

    try {
        const identifier = `${namespace}:${req.ip}`;
        const result = await limiter.limit(identifier);

        res.set({
            'RateLimit-Limit': String(result.limit),
            'RateLimit-Remaining': String(Math.max(0, result.remaining)),
            'RateLimit-Reset': String(Math.ceil(result.reset / 1000)),
        });

        if (!result.success) {
            res.set('Retry-After', String(Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))));
            return res.status(429).json({
                success: false,
                message: 'Too many requests. Please try again later.',
            });
        }
    } catch (error) {
        // A temporary Redis outage should not take the API offline.
        console.error('Upstash rate-limit error:', error.message);
    }

    next();
};

const cachePublicCourses = (ttlSeconds) => async (req, res, next) => {
    if (!redis || req.method !== 'GET') return next();

    const key = `cms:cache:courses:${req.originalUrl}`;

    try {
        const cached = await redis.get(key);
        if (cached) {
            res.set('X-Cache', 'HIT');
            return res.status(200).json(cached);
        }
    } catch (error) {
        console.error('Upstash cache read error:', error.message);
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            redis.set(key, body, { ex: ttlSeconds }).catch((error) => {
                console.error('Upstash cache write error:', error.message);
            });
            res.set('X-Cache', 'MISS');
        }
        return originalJson(body);
    };

    next();
};

const warnWhenUpstashIsMissing = () => {
    if (!hasUpstashCredentials) {
        console.warn('Upstash is disabled: set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in the backend environment.');
    }
};

module.exports = { rateLimit, cachePublicCourses, warnWhenUpstashIsMissing };
