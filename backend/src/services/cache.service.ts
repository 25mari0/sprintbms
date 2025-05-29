import redisService from './redis.service';
import { AppError } from '../utils/error';

export interface CacheOptions {
  ttl?: number;
  keyPrefix?: string;
  fallbackToDb?: boolean;
}

export class CacheService {
  private defaultTTL = 3600; // 1 hour

  // Helper to revive dates in cached JSON
  private reviveDates(key: string, value: unknown) {
    if (typeof value === 'string') {
      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
      if (dateRegex.test(value)) {
        return new Date(value);
      }
    }
    return value;
  }

  /**
   * Generic cache-aside pattern implementation
   */
  async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const { ttl = this.defaultTTL, keyPrefix = '', fallbackToDb = true } = options;
    const cacheKey = keyPrefix ? `${keyPrefix}:${key}` : key;

    try {
      // 1. Try cache first
      const cached = await redisService.get(cacheKey);
      if (cached) {
        console.log(`Cache HIT: ${cacheKey}`);
        return JSON.parse(cached, this.reviveDates);
      }

      console.log(`Cache MISS: ${cacheKey}`);
      
      // 2. Execute fetch function (database call)
      const result = await fetchFunction();
      
      // 3. Cache the result if it exists
      if (result !== null && result !== undefined) {
        await redisService.set(cacheKey, JSON.stringify(result), ttl);
      }
      
      return result;
    } catch (error) {
      if (fallbackToDb) {
        console.warn(`Cache error for ${cacheKey}, falling back to database:`, error);
        return await fetchFunction();
      }
      throw new AppError(500, `Cache operation failed: ${error}`);
    }
  }

  /**
   * Invalidate cache by pattern - handles wildcards
   */
  async invalidate(pattern: string): Promise<void> {
    try {
      console.log(`Invalidating cache pattern: ${pattern}`);
      const keys = await redisService.getClient().keys(pattern);
      if (keys.length > 0) {
        await redisService.getClient().del(...keys);
        console.log(`Invalidated ${keys.length} cache keys matching: ${pattern}`);
      } else {
        console.log(`No cache keys found for pattern: ${pattern}`);
      }
    } catch (error) {
      console.warn(`Failed to invalidate cache pattern ${pattern}:`, error);
    }
  }

  /**
   * Invalidate specific key
   */
  async invalidateKey(key: string): Promise<void> {
    try {
      await redisService.del(key);
    } catch (error) {
      console.warn(`Failed to invalidate cache key ${key}:`, error);
    }
  }

  /**
   * Cache multiple items at once
   */
  async setMultiple<T>(items: Array<{ key: string; value: T; ttl?: number }>): Promise<void> {
    const pipeline = redisService.getClient().pipeline();
    
    items.forEach(({ key, value, ttl = this.defaultTTL }) => {
      pipeline.setex(key, ttl, JSON.stringify(value));
    });
    
    await pipeline.exec();
  }
}

export const cacheService = new CacheService();
