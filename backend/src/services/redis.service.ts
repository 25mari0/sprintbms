import  redisClient from '../config/redis';
import { AppError } from '../utils/error';
import { CACHE_CONFIG } from '../config/cache.config';

class RedisService {
  // Basic Redis operations
  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await redisClient.set(key, value, ttl);
      } else {
        await redisClient.getClient().set(key, value);
      }
    } catch (error) {
      throw new AppError(500, `Redis SET failed: ${error}`);
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await redisClient.get(key);
    } catch (error) {
      throw new AppError(500, `Redis GET failed: ${error}`);
    }
  }

  async del(key: string): Promise<number> {
    try {
      return await redisClient.del(key);
    } catch (error) {
      throw new AppError(500, `Redis DEL failed: ${error}`);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      throw new AppError(500, `Redis EXISTS failed: ${error}`);
    }
  }

  getClient() {
    return redisClient.getClient();
  }

  // Token Management (Cache-Only Pattern)
  async storeRefreshToken(userId: string, tokenHash: string, metadata: {
    ipAddress: string;
    location: string;
    expiresAt: Date;
  }): Promise<void> {
    try {
      const key = `refresh_token:${userId}`;
      const tokenData = {
        hash: tokenHash,
        ipAddress: metadata.ipAddress,
        location: metadata.location,
        expiresAt: metadata.expiresAt.toISOString(),
        createdAt: new Date().toISOString(),
      };

      await redisClient.hset(key, 'data', JSON.stringify(tokenData));
      await redisClient.expire(key, CACHE_CONFIG.TTL.REFRESH_TOKEN);
    } catch (error) {
      throw new AppError(500, `Failed to store refresh token: ${error}`);
    }
  }

  async getRefreshToken(userId: string): Promise<{
    hash: string;
    ipAddress: string;
    location: string;
    expiresAt: Date;
    createdAt: Date;
  } | null> {
    try {
      const key = `refresh_token:${userId}`;
      const data = await redisClient.hget(key, 'data');
      
      if (!data) return null;
      
      const tokenData = JSON.parse(data);
      return {
        ...tokenData,
        expiresAt: new Date(tokenData.expiresAt),
        createdAt: new Date(tokenData.createdAt),
      };
    } catch (error) {
      throw new AppError(500, `Failed to get refresh token: ${error}`);
    }
  }

  async deleteRefreshToken(userId: string): Promise<void> {
    try {
      const key = `refresh_token:${userId}`;
      await redisClient.del(key);
    } catch (error) {
      throw new AppError(500, `Failed to delete refresh token: ${error}`);
    }
  }

  // User Session Management (Cache-Only Pattern)
  async storeUserSession(userId: string, sessionData: {
    role: string;
    businessId?: string;
    lastActivity: Date;
  }): Promise<void> {
    try {
      const key = `session:${userId}`;
      await redisClient.hset(key, 'data', JSON.stringify({
        ...sessionData,
        lastActivity: sessionData.lastActivity.toISOString(),
      }));
      await redisClient.expire(key, CACHE_CONFIG.TTL.USER_SESSION);
    } catch (error) {
      throw new AppError(500, `Failed to store user session: ${error}`);
    }
  }

  async getUserSession(userId: string): Promise<{
    role: string;
    businessId?: string;
    lastActivity: Date;
  } | null> {
    try {
      const key = `session:${userId}`;
      const data = await redisClient.hget(key, 'data');
      
      if (!data) return null;
      
      const sessionData = JSON.parse(data);
      return {
        ...sessionData,
        lastActivity: new Date(sessionData.lastActivity),
      };
    } catch (error) {
      throw new AppError(500, `Failed to get user session: ${error}`);
    }
  }

  async deleteUserSession(userId: string): Promise<void> {
    try {
      const key = `session:${userId}`;
      await redisClient.del(key);
    } catch (error) {
      throw new AppError(500, `Failed to delete user session: ${error}`);
    }
  }

  // Rate Limiting (Cache-Only Pattern)
  async checkRateLimit(identifier: string, limit: number, windowSeconds: number): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    try {
      const key = `rate_limit:${identifier}`;
      const current = await this.get(key);
      
      if (!current) {
        await this.set(key, '1', windowSeconds);
        return {
          allowed: true,
          remaining: limit - 1,
          resetTime: Date.now() + (windowSeconds * 1000),
        };
      }

      const count = parseInt(current);
      if (count >= limit) {
        const ttl = await redisClient.getClient().ttl(key);
        return {
          allowed: false,
          remaining: 0,
          resetTime: Date.now() + (ttl * 1000),
        };
      }

      await redisClient.getClient().incr(key);
      const ttl = await redisClient.getClient().ttl(key);
      
      return {
        allowed: true,
        remaining: limit - count - 1,
        resetTime: Date.now() + (ttl * 1000),
      };
    } catch (error) {
      throw new AppError(500, `Failed to check rate limit: ${error}`);
    }
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      await this.set('health_check', 'ok', 10);
      const result = await this.get('health_check');
      await this.del('health_check');
      return result === 'ok';
    } catch {
      return false;
    }
  }
}

export default new RedisService();
