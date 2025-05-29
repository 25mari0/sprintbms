import { cacheService } from './cache.service';
import redisService from './redis.service';
import { CACHE_CONFIG } from '../config/cache.config';

export class CacheManager {
  /**
   * Warm up frequently accessed caches
   */
  async warmUpCache(businessId: string): Promise<void> {
    console.log(`Warming up cache for business: ${businessId}`);
    
    // Import services dynamically to avoid circular dependencies
    const { default: businessService } = await import('./business.service');
    const { default: serviceService } = await import('./service.service');
    
    const warmUpTasks = [
      // Business data
      cacheService.getOrSet(
        `business:${businessId}`,
        () => businessService.getBusinessById(businessId),
        { ttl: CACHE_CONFIG.TTL.BUSINESS }
      ),
      
      // Services
      cacheService.getOrSet(
        `services:${businessId}`,
        () => serviceService.getAllServicesForBusiness(businessId),
        { ttl: CACHE_CONFIG.TTL.SERVICES }
      ),
    ];

    await Promise.allSettled(warmUpTasks);
    console.log(`Cache warm-up completed for business: ${businessId}`);
  }

  /**
   * Clear all caches for a business
   */
  async clearBusinessCache(businessId: string): Promise<void> {
    const patterns = [
      `business:${businessId}*`,
      `services:${businessId}*`,
      `service:*:${businessId}*`,
      `customers:${businessId}*`,
      `bookings:${businessId}*`,
    ];

    await Promise.all(
      patterns.map(pattern => cacheService.invalidate(pattern))
    );
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    hitRate: number;
    isHealthy: boolean;
  }> {
    const client = redisService.getClient();
    const [info, keyCount, isHealthy] = await Promise.all([
      client.info('memory'),
      client.dbsize(),
      redisService.healthCheck()
    ]);
    
    return {
      totalKeys: keyCount,
      memoryUsage: this.parseMemoryUsage(info),
      hitRate: await this.calculateHitRate(),
      isHealthy,
    };
  }

  /**
   * Scheduled cache maintenance
   */
  async performMaintenance(): Promise<void> {
    console.log('Starting cache maintenance...');
    
    // Clean up expired keys (Redis does this automatically, but we can be proactive)
    const patterns = Object.values(CACHE_CONFIG.PATTERNS);
    
    for (const pattern of patterns) {
      try {
        const keys = await redisService.getClient().keys(pattern);
        console.log(`Found ${keys.length} keys for pattern: ${pattern}`);
      } catch (error) {
        console.warn(`Maintenance error for pattern ${pattern}:`, error);
      }
    }
    
    console.log('Cache maintenance completed');
  }

  private parseMemoryUsage(info: string): string {
    const match = info.match(/used_memory_human:(.+)/);
    return match ? match[1].trim() : 'Unknown';
  }

  private async calculateHitRate(): Promise<number> {
    try {
      const info = await redisService.getClient().info('stats');
      const hitsMatch = info.match(/keyspace_hits:(\d+)/);
      const missesMatch = info.match(/keyspace_misses:(\d+)/);
      
      if (hitsMatch && missesMatch) {
        const hits = parseInt(hitsMatch[1]);
        const misses = parseInt(missesMatch[1]);
        const total = hits + misses;
        return total > 0 ? (hits / total) * 100 : 0;
      }
    } catch (error) {
      console.warn('Failed to calculate hit rate:', error);
    }
    return 0;
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();
