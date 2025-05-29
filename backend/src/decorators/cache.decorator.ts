/* eslint-disable @typescript-eslint/no-explicit-any */
// Since we are using decorators, which need to be "ambiguous", we disable the annoying TS rule
import { cacheService, CacheOptions } from '../services/cache.service';

export interface CacheDecoratorOptions extends CacheOptions {
  keyGenerator?: (...args: any[]) => string;
  invalidatePatterns?: string[];
}

/**
 * Method decorator for automatic caching
 */
export function Cacheable(options: CacheDecoratorOptions = {}) {
  return function <T>(
    target: any,
    propertyName: string | symbol,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const method = descriptor.value;
    if (!method) return descriptor;

    descriptor.value = async function (...args: any[]): Promise<T> {
      const { keyGenerator, keyPrefix = `${target.constructor.name}:${String(propertyName)}` } = options;
      
      // Generate cache key
      const cacheKey = keyGenerator 
        ? keyGenerator(...args)
        : `${keyPrefix}:${JSON.stringify(args)}`;

      // Use cache service
      return await cacheService.getOrSet(
        cacheKey,
        () => method.apply(this, args),
        options
      ) as T;
    };

    return descriptor;
  };
}

/**
 * Method decorator for cache invalidation
 */
export function CacheInvalidate(patterns: string[]) {
  return function <T>(
    target: any,
    propertyName: string | symbol,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const method = descriptor.value;
    if (!method) return descriptor;

    descriptor.value = async function (...args: any[]): Promise<T> {
      const result = await method.apply(this, args);
      
      // Invalidate cache patterns after successful operation
      for (const pattern of patterns) {
        await cacheService.invalidate(pattern);
      }
      
      return result;
    };

    return descriptor;
  };
}
