import AppDataSource from '../db/data-source';
import { Business } from '../entities/Business';
import { User } from '../entities/User';
import { AppError } from '../utils/error';
import authService from './auth.service';

class BusinessService {
  private businessRepository = AppDataSource.getRepository(Business);
  private userRepository = AppDataSource.getRepository(User);

  async createBusiness(
    businessId: string | undefined,
    userId: string,
    name: string,
    licenseExpirationDate: Date
    ): Promise<{ business: Business; newAccessToken: string }> {

    // Check if user already has a business, by looking at the token payload
    if (businessId) throw new AppError(400, 'User already has a business');
  
    // Create new business
    const business = this.businessRepository.create({
      name,
      licenseExpirationDate,
    });

    // Save the business
    await this.businessRepository.save(business);

    // Assuming you have an association between User and Business
    const user = await this.userRepository.findOne({ where: { id: userId } });
    user!.business = business;
    await this.userRepository.save(user!);

    // Generate new token with business ID
    const newAccessToken = authService.generateAccessToken(
    user!.id,
    user!.role,
    business.id
    ); // Assuming generateAccessToken can handle business ID
      

    return { business, newAccessToken };
  }

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
