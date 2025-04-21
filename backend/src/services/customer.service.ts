import AppDataSource from '../db/data-source';
import { Business } from '../entities/Business';
import { Customer } from '../entities/Customer';
import { CustomerFilters } from '../types/customerTypes';
import { PaginatedResponse } from '../types/sharedTypes';
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

  async getCustomer(customerId: string, businessId: string): Promise<Customer | null> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId, business: { id: businessId } },
      relations: ['business'],
    });

    if (!customer) {
      throw new AppError(404, 'Customer not found');
    }

    return customer;
  }

  async updateCustomer(
    customerId: string, businessId: string, updateData: Partial<Customer>
  ): Promise<Customer> {
    // Check if the customer exists
    const customer = await this.customerRepository.findOne({
      where: { id: customerId, business: { id: businessId } },
    });

    if (!customer) throw new AppError(404, 'Customer not found');

    // Update customer details
    Object.assign(customer, updateData);

    // Save the updated customer
    return await this.customerRepository.save(customer);
  }

  async deleteCustomer(customerId: string, businessId: string): Promise<void> {
    // Check if the customer exists
    const customer = await this.customerRepository.findOne({
      where: { id: customerId, business: { id: businessId } },
    });

    if (!customer) throw new AppError(404, 'Customer not found');

    // Delete the customer
    await this.customerRepository.remove(customer);
  }

  async getCustomers(filters: CustomerFilters): Promise<PaginatedResponse<Customer>> {
    const { 
      page = 1, 
      limit = 20, 
      search,
      businessId,
    } = filters;

    const skip = (page - 1) * limit;

    const queryBuilder = this.customerRepository.createQueryBuilder('customer')
      .leftJoinAndSelect('customer.business', 'business')
      .skip(skip)
      .take(limit)
      .orderBy('customer.name', 'DESC');

    if (search) {
      queryBuilder.andWhere('customer.name ILIKE :search OR customer.phone ILIKE :search', { search: `%${search}%` });
    }

    queryBuilder.andWhere('customer.business_id = :businessId', { businessId });

    try {
      const [customers, total] = await queryBuilder.getManyAndCount();

      return {
        data: customers,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };

    } catch {
      throw new Error('Failed to fetch customers');
    }

  }
  
}

export default new CustomerService();