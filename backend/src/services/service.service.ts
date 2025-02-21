import { Service } from '../entities/Service';
import AppDataSource from '../db/data-source';
import { BookingService } from '../entities/BookingService';
import { AppError } from '../utils/error';

export class ServiceService {
  private serviceRepository = AppDataSource.getRepository(Service);
  private bookingserviceRepository = AppDataSource.getRepository(BookingService)

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

  async getServiceById(serviceId: string, businessId: string): Promise<Service> {
    // Validate inputs
    if (!serviceId) {
      throw new AppError(400, 'Service ID is required');
    }
    if (!businessId) {
      throw new AppError(400, 'Business ID is required');
    }

    // Parse serviceId to integer and check validity
    const parsedServiceId = parseInt(serviceId, 10);
    if (isNaN(parsedServiceId) || parsedServiceId <= 0) {
      throw new AppError(400, 'Service ID must be a valid positive integer');
    }

    const service = await this.serviceRepository.findOne({
      where: { id: parsedServiceId, business: { id: businessId } },
    });

    if (!service) {
      throw new AppError(404, `Service with ID ${serviceId} not found for business ${businessId}`);
    }

    return service;
  }

  async updateService(serviceId: string, businessId: string, updates: Partial<Service>): Promise<Service> {
    // Validate updates
    if (!updates || Object.keys(updates).length === 0) {
      throw new AppError(400, 'No updates provided');
    }

    // Get the existing service (this will throw if not found)
    const service = await this.getServiceById(serviceId, businessId);

    // Apply updates and save
    Object.assign(service, updates);
    const updatedService = await this.serviceRepository.save(service);

    return updatedService;
  }

  async deleteService(serviceId: string, businessId: string): Promise<boolean> {
    const serviceToDelete = await this.serviceRepository.findOne({
      where: {
        id: parseInt(serviceId, 10),
        business: { id: businessId }
      }
    });  

    if(!serviceToDelete) throw new AppError(400, 'Service not found')
      
    await this.bookingserviceRepository
    .createQueryBuilder()
    .update()
    .set({ 
      service: () => 'NULL',  // Use this syntax to set to NULL in SQL
      service_name_at_booking: serviceToDelete.name 
    })    .where("service_id = :serviceId", { serviceId: parseInt(serviceId, 10) })
    .execute();

    // Now delete the service
    const result = await this.serviceRepository.delete({
    id: parseInt(serviceId, 10),
    business: { id: businessId },
    });

    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }
}

export default new ServiceService();