import Redis from 'ioredis';
import { env } from './env.js';

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(env.redisUrl, {
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      lazyConnect: true,
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    redis.on('error', (err) => {
      console.error('❌ Redis error:', err);
    });
  }

  return redis;
}

export async function connectRedis(): Promise<void> {
  const client = getRedis();
  await client.connect();
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    console.log('Redis disconnected');
  }
}

// Cache utilities
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const data = await getRedis().get(key);
    return data ? JSON.parse(data) : null;
  },

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const data = JSON.stringify(value);
    if (ttlSeconds) {
      await getRedis().setex(key, ttlSeconds, data);
    } else {
      await getRedis().set(key, data);
    }
  },

  async del(key: string): Promise<void> {
    await getRedis().del(key);
  },

  async delPattern(pattern: string): Promise<void> {
    const keys = await getRedis().keys(pattern);
    if (keys.length > 0) {
      await getRedis().del(...keys);
    }
  },
};

// Session blocklist (for banned users)
export const blocklist = {
  async add(userId: string, expiresInSeconds: number): Promise<void> {
    await getRedis().setex(`blocklist:${userId}`, expiresInSeconds, '1');
  },

  async check(userId: string): Promise<boolean> {
    const result = await getRedis().get(`blocklist:${userId}`);
    return result === '1';
  },

  async remove(userId: string): Promise<void> {
    await getRedis().del(`blocklist:${userId}`);
  },
};
