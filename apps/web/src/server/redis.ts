import Redis from "ioredis";

declare global {
  // eslint-disable-next-line no-var
  var redisGlobal: Redis | undefined;
}

const REDIS_URL = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";

export function createRedisConnection(): Redis {
  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,
    lazyConnect: true,
    retryStrategy(times) {
      // Exponential backoff with max 20 seconds delay
      const delay = Math.min(times * 1000, 20000);
      return delay;
    },
  });

  client.on("error", (error) => {
    // eslint-disable-next-line no-console
    console.error("[Redis] Connection error:", error.message);
  });

  client.on("connect", () => {
    // eslint-disable-next-line no-console
    console.log("[Redis] Successfully connected to Redis instance.");
  });

  return client;
}

export const redis: Redis = globalThis.redisGlobal ?? createRedisConnection();

if (process.env.NODE_ENV !== "production") {
  globalThis.redisGlobal = redis;
}
