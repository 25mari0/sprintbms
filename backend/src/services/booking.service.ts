// backend/src/services/booking.service.ts
import AppDataSource from '../db/data-source';
import { Booking } from '../entities/Booking';
import { BookingService } from '../entities/BookingService';
import { Service } from '../entities/Service';
import { Customer } from '../entities/Customer';
import { BookingWorker } from '../entities/BookingWorker';
import { AppError } from '../utils/error';
import { BookingFilters } from '../types/bookingTypes';
import { PaginatedResponse } from '../types/sharedTypes';
import { User } from '../entities/User';

class BookingManagementService {
  private bookingRepository = AppDataSource.getRepository(Booking);
  private bookingServiceRepository = AppDataSource.getRepository(BookingService);
  private bookingWorkerRepository = AppDataSource.getRepository(BookingWorker);
  private serviceRepository = AppDataSource.getRepository(Service);
  private customerRepository = AppDataSource.getRepository(Customer);
  private userRepository = AppDataSource.getRepository(User);

  async createBooking(
    businessId: string,
    customerId: string,
    licensePlate: string,
    pickupDate: Date,
    services: { serviceId: number; price: number }[],
    workers: { workerId: string }[],
  ): Promise<Booking> {
    // Start a transaction
    return await this.bookingRepository.manager.transaction(async (transactionalEntityManager) => {
      // Validate customer
      const customer = await transactionalEntityManager.findOneBy(this.customerRepository.target, { id: customerId });
      if (!customer) throw new AppError(400, 'Customer not found');
  
      // Create booking entity
      const booking = this.bookingRepository.create({
        business: { id: businessId },
        customer: customer,
        vehicle_license_plate: licensePlate,
        pickup_at: pickupDate,
        status: 'Pending',
      });
  
      // Save booking
      await transactionalEntityManager.save(booking);
  
      // Process services
      for (const service of services) {
        const serviceEntity = await transactionalEntityManager.findOneBy(this.serviceRepository.target, { 
          id: service.serviceId 
        });
        if (!serviceEntity) throw new AppError(400, 'Service not found');
  
        await transactionalEntityManager.save(this.bookingServiceRepository.target, {
          booking: booking,
          service: serviceEntity,
          base_price: serviceEntity.price,
          charged_price: service.price,
          service_name_at_booking: serviceEntity.name,
        });
      }
  
      for (const worker of workers) {
        const workerEntity = await transactionalEntityManager.findOne(
          this.userRepository.target,
          {
            where: { id: worker.workerId },
            relations: ['business']         // ← tell TypeORM to load the `business` relation
          }
        );
        if (!workerEntity) throw new AppError(400, 'Worker not found');
        
        if (workerEntity.business?.id !== businessId) {
          throw new AppError(400, 'Worker does not belong to this business');
        }
        
  
        await transactionalEntityManager.save(this.bookingWorkerRepository.target, {
          booking: booking,
          worker: workerEntity,
        });
      }
  
      return booking;
    });
  }

  async getBookingById(bookingId: string, businessId: string): Promise<Booking> {
    if (!bookingId) {
      throw new AppError(400, 'Booking ID is required');
    }

    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, business: { id: businessId } },
      relations: [
        'customer',
        'bookingServices',
        'bookingServices.service',
        'bookingWorkers',
        'bookingWorkers.worker',
        'business',
      ],
    });

    if (!booking) {
      throw new AppError(404, `Booking with ID ${bookingId} not found`);
    }

    return booking;
  }

  async deleteBooking(bookingId: string, businessId: string): Promise<void> {
    const booking = await this.bookingRepository.findOne({ where: { id: bookingId, business: { id: businessId } }, relations: ['business'] });
    if (!booking) throw new AppError(400, 'Booking not found');
    await this.bookingServiceRepository.delete({ booking: { id: bookingId } });
    await this.bookingWorkerRepository.delete({ booking: { id: bookingId } });
    await this.bookingRepository.remove(booking);
  }

  async updateBooking(
    bookingId: string,
    updateData: Partial<Booking>,
    businessId: string,
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({ where: { id: bookingId, business: { id: businessId } }, relations: ['business'] });
    if (!booking) throw new AppError(400, 'Booking not found');
    Object.assign(booking, updateData);
    return await this.bookingRepository.save(booking);
  }

  async getBookings(
    filters: BookingFilters,
  ): Promise<PaginatedResponse<Booking>> {
    const {
      page = 1,
      limit = 20,
      status,
      startDate,
      endDate,
      customerId,
      search,
      businessId,
    } = filters;

    const skip = (page - 1) * limit;

    // Build the query dynamically
    const queryBuilder = this.bookingRepository.createQueryBuilder('booking')
    .leftJoinAndSelect('booking.business', 'business')        // Join related entities
    .leftJoinAndSelect('booking.customer', 'customer')
    .leftJoinAndSelect('booking.bookingServices', 'bookingServices')
    .skip(skip)                                               // Apply pagination
    .take(limit)
    .orderBy('booking.pickup_at', 'DESC')                   // Sort by creation date

    // Apply filters only if they are provided
    if (status) {
      queryBuilder.andWhere('booking.status = :status', { status });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('booking.pickup_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('booking.pickup_at >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('booking.pickup_at <= :endDate', { endDate });
    }

    if (customerId) {
      queryBuilder.andWhere('booking.customer_id = :customerId', { customerId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(booking.vehicle_license_plate ILIKE :search OR customer.name ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    queryBuilder.andWhere('booking.business_id = :businessId', { businessId });

    try {
      // Execute the query and get bookings + total count
      const [bookings, total] = await queryBuilder.getManyAndCount();

      return {
        data: bookings,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch {
      throw new Error('Failed to fetch bookings');
    }
  }

}

export default new BookingManagementService();
