import AppDataSource from '../db/data-source';
import { Business } from '../entities/Business';
import { Customer } from '../entities/Customer';
import { AppError } from '../utils/error';

class CustomerService {
  private customerRepository = AppDataSource.getRepository(Customer);
  private businessRepository = AppDataSource.getRepository(Business);

  public async addCustomer(
    businessId: string,
    name: string,
    phone?: string
  ): Promise<Customer> {
    // First, check if the business exists
    const business = await this.businessRepository.findOne({ where: { id: businessId } });

    if (!business) {
      throw new AppError(400, 'Business not found');
    }

    // Create new customer
    const customer = this.customerRepository.create({
      name,
      phone,
      business: business,
    });

    // Save the customer
    await this.customerRepository.save(customer);

    return customer;
  }
  
}

export default new CustomerService();