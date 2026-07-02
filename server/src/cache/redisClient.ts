import { Redis } from "@upstash/redis"

/**
 * Shared Upstash Redis client (REST-based, no persistent connection —
 * safe to reuse across serverless invocations). Used both for the
 * application cache (cache.ts) and for one-off keys like the
 * registration anti-replay guard (routes/public/public.ts).
 */
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN || ""
})

export default redis
