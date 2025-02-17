import { Service } from '../entities/Service';
import AppDataSource from '../db/data-source';

export class ServiceService {
  private serviceRepository = AppDataSource.getRepository(Service);

  async createService(
    businessId: string,
    name: string,
    price: number,
    estimated_time_minutes: number
  ): Promise<Service> {
    const service = this.serviceRepository.create({
      name,
      price,
      estimated_time_minutes,
      business: { id: businessId },
    });
    return await this.serviceRepository.save(service);
  }

  async getAllServicesForBusiness(businessId: string): Promise<Service[]> {
    return await this.serviceRepository.find({
      where: { business: { id: businessId } },
    });
  }

  async getServiceById(serviceId: string, businessId: string): Promise<Service | null> {
    return await this.serviceRepository.findOne({
      where: { id: parseInt(serviceId, 10), business: { id: businessId } },
    });
  }

  async updateService(serviceId: string, businessId: string, updates: Partial<Service>): Promise<Service | null> {
    const service = await this.getServiceById(serviceId, businessId);
    if (!service) return null;

    Object.assign(service, updates);
    return await this.serviceRepository.save(service);
  }

  async deleteService(serviceId: string, businessId: string): Promise<boolean> {
    const result = await this.serviceRepository.delete({
      id: parseInt(serviceId, 10),
      business: { id: businessId },
    });
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }
}

export default new ServiceService();