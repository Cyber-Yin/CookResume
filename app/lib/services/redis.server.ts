import type { Redis as RedisType } from "ioredis";
import Redis from "ioredis";

let RedisInstance: RedisType;

declare global {
  var redis: RedisType | undefined;
}

if (process.env.NODE_ENV === "production") {
  RedisInstance = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PASSWORD,
    db: Number(process.env.REDIS_DB) || 0,
  });
} else {
  if (!global.redis) {
    global.redis = new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT) || 6379,
      username: process.env.REDIS_USER,
      password: process.env.REDIS_PASSWORD,
      db: Number(process.env.REDIS_DB) || 0,
    });
  }
  RedisInstance = global.redis;
}

export default RedisInstance;
