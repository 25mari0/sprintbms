import AppDataSource from '../db/data-source';
import { Business } from '../entities/Business';
import { User } from '../entities/User';
import { AppError } from '../utils/error';
import authService from './auth.service';
import { CACHE_CONFIG } from '../config/cache.config';
import { Cacheable, CacheInvalidate } from '../decorators/cache.decorator';

class BusinessService {
  private businessRepository = AppDataSource.getRepository(Business);
  private userRepository = AppDataSource.getRepository(User);

  @CacheInvalidate([
    CACHE_CONFIG.PATTERNS.BUSINESS, 
    'business:user:*'  // wildcards - clears user-business cache
  ])  
  async createBusiness(
    userId: string,
    name: string,
    licenseExpirationDate: Date
    ): Promise<{ business: Business; newAccessToken: string }> {

    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['business'] });

    console.log(user)

    // Check if user already has a business, by looking at the token payload
    if (user?.business) 
      throw new AppError(400, 'User already has a business');
  
    // Create new business
    const business = this.businessRepository.create({
      name,
      licenseExpirationDate,
    });

    // Save the business
    await this.businessRepository.save(business);

    // Assuming you have an association between User and Business
    user!.business = business;
    await this.userRepository.save(user!);

    // Generate new token with business ID
    const newAccessToken = authService.generateAccessToken(
    user!.id,
    user!.role,
    business.id,
    licenseExpirationDate
    ); // Assuming generateAccessToken can handle business ID
      

    return { business, newAccessToken };
  }

  @Cacheable({
    keyGenerator: (userId: string) => `business:user:${userId}`,
    ttl: CACHE_CONFIG.TTL.BUSINESS 
  })
  async getBusinessByUserId(userId: string): Promise<Business | null> {
    const business = await this.businessRepository.findOne({
      where: {
        users: { id: userId }, 
      },
      relations: ['users'],
    });

    if (business) {
      // Ensure date is a Date object, avoids caching issues with JSON serialization
      business.licenseExpirationDate = new Date(business.licenseExpirationDate);
    }

    return business;
  }

  @CacheInvalidate([
    CACHE_CONFIG.PATTERNS.BUSINESS,
    'business:user:*'
  ])
  async extendBusinessExpiration(userId: string, daysToAdd: number): Promise<Business> {
    const business = await this.getBusinessByUserId(userId);
    if (!business) {
      throw new AppError(404, 'Business not found'); // 404 more appropriate than 401
    }

    const today = new Date();
    const currentExpiration = new Date(business.licenseExpirationDate);
    const baseDate = currentExpiration > today ? currentExpiration : today;

    const newExpiration = new Date(baseDate);
    newExpiration.setDate(newExpiration.getDate() + daysToAdd);

    business.licenseExpirationDate = newExpiration;
    await this.businessRepository.save(business);
    return business;
  }

  @Cacheable({
    keyGenerator: (businessId: string) => `business:${businessId}`,
    ttl: CACHE_CONFIG.TTL.BUSINESS, 
    keyPrefix: 'business'
  })
  async getBusinessById(businessId: string): Promise<Business | null> {

    if (!businessId) throw new AppError(400, 'Business ID is required');

    try {
      return await this.businessRepository.findOne({ where: { id: businessId } });
    }
    catch {
      throw new AppError(404, `Business with ID ${businessId} not found`); 
    }

  }
}

export default new BusinessService();
