import AppDataSource from '../db/data-source';
import { Business } from '../entities/Business';
import { User } from '../entities/User';
import authService from './auth.service';

class BusinessService {
  private businessRepository = AppDataSource.getRepository(Business);
  private userRepository = AppDataSource.getRepository(User);

  async createBusiness(
    userId: string,
    name: string,
    licenseExpirationDate: Date
): Promise<{ business: Business; newToken: string }> {
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
    const newToken = authService.generateAccessToken(
    user!.id,
    user!.role,
    business.id
    ); // Assuming generateAccessToken can handle business ID
      

    return { business, newToken };
  }

  async getBusinessById(businessId: string): Promise<Business | null> {
    try {
      return await this.businessRepository.findOne({ where: { id: businessId } });
    }
    catch (error) {
      const err = error as Error;
      err.message = `Failed to retrieve business: ${err.message}`;
      throw err;
    }

  }
}

export default new BusinessService();