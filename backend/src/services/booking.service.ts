// backend/src/services/booking.service.ts
import AppDataSource from '../db/data-source';
import { Booking } from '../entities/Booking';
import { BookingService } from '../entities/BookingService';
import { Service } from '../entities/Service';
import { Customer } from '../entities/Customer';
import { BookingFilter } from '../types/bookingTypes';
import { PaginationOptions } from '../types/sharedTypes';

class BookingManagementService {
  private bookingRepository = AppDataSource.getRepository(Booking);
  private bookingServiceRepository = AppDataSource.getRepository(BookingService);
  private serviceRepository = AppDataSource.getRepository(Service);
  private customerRepository = AppDataSource.getRepository(Customer);

  async createBooking(
    businessId: string,
    customerId: string,
    licensePlate: string,
    pickupDate: Date,
    services: { serviceId: number; price: number }[]
  ): Promise<Booking> {
    const customer = await this.customerRepository.findOneBy({ id: customerId });
    if (!customer) throw new Error('Customer not found');

    const booking = this.bookingRepository.create({
      business: { id: businessId },
      customer: customer,
      vehicle_license_plate: licensePlate,
      pickup_at: pickupDate,
      status: 'Pending',
    });

    await this.bookingRepository.save(booking);

    for (const service of services) {
      const serviceEntity = await this.serviceRepository.findOneBy({ id: service.serviceId });
      if (!serviceEntity) throw new Error('Service not found');
      
      await this.bookingServiceRepository.save({
        booking: booking,
        service: serviceEntity,
        base_price: serviceEntity.price,
        charged_price: service.price,
      });
    }

    return booking;
  }


  async getBookingById(bookingId: string): Promise<Booking | null> {
    return await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: [
        'customer',
        'bookingServices',
        'bookingServices.service',
        'bookingWorkers',
        'bookingWorkers.worker',
      ],
    });
  }

  async deleteBooking(bookingId: string): Promise<void> {
    const booking = await this.bookingRepository.findOneBy({ id: bookingId });
    if (!booking) throw new Error('Booking not found');
    await this.bookingRepository.remove(booking);
  }

  async updateBooking(
    bookingId: string,
    updateData: Partial<Booking>,
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findOneBy({ id: bookingId });
    if (!booking) throw new Error('Booking not found');
    Object.assign(booking, updateData);
    return await this.bookingRepository.save(booking);
  }

  async getBookingsWithFilter(
    businessId: string,
    filters: BookingFilter = {},
    { page = 1, pageSize = 10, maxPageSize = 100 }: PaginationOptions = {},
  ): Promise<{ bookings: Booking[]; total: number }> {
    // Ensure pageSize doesn't exceed maxPageSize
    pageSize = Math.min(pageSize, maxPageSize);

    const queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.businessId = :businessId', { businessId });

    // Apply filters if provided
    if (filters.status)
      queryBuilder.andWhere('booking.status = :status', {
        status: filters.status,
      });
    if (filters.vehicle_license_plate)
      queryBuilder.andWhere(
        'booking.vehicle_license_plate LIKE :licensePlate',
        { licensePlate: `%${filters.vehicle_license_plate}%` },
      );
    if (filters.pickup_at)
      queryBuilder.andWhere('DATE(booking.pickup_at) = DATE(:pickupAt)', {
        pickupAt: filters.pickup_at,
      });
    if (filters.created_at)
      queryBuilder.andWhere('DATE(booking.created_at) = DATE(:createdAt)', {
        createdAt: filters.created_at,
      });

    // Count total results before applying pagination
    const total = await queryBuilder.getCount();

    // Apply pagination
    const bookings = await queryBuilder
      .orderBy('booking.created_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return { bookings, total };
  }
}

export default new BookingManagementService();
