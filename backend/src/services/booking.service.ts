// backend/src/services/booking.service.ts
import AppDataSource from '../db/data-source';
import { Booking } from '../entities/Booking';
import { BookingService } from '../entities/BookingService';
import { Service } from '../entities/Service';
import { Customer } from '../entities/Customer';
import { BookingFilter } from '../types/bookingTypes';
import { PaginationOptions } from '../types/sharedTypes';
import { SelectQueryBuilder } from 'typeorm';
import { BookingWorker } from '../entities/BookingWorker';
import { AppError } from '../utils/error';

class BookingManagementService {
  private bookingRepository = AppDataSource.getRepository(Booking);
  private bookingServiceRepository = AppDataSource.getRepository(BookingService);
  private bookingWorkerRepository = AppDataSource.getRepository(BookingWorker);
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
    if (!customer) throw new AppError(400, 'Customer not found');

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
      if (!serviceEntity) throw new AppError(400, 'Service not found');
      
      await this.bookingServiceRepository.save({
        booking: booking,
        service: serviceEntity,
        base_price: serviceEntity.price,
        charged_price: service.price,
        service_name_at_booking: serviceEntity.name
      });
    }

    return booking;
  }

  async getBookingById(bookingId: string): Promise<Booking> {
    if (!bookingId) {
      throw new AppError(400, 'Booking ID is required');
    }

    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: [
        'customer',
        'bookingServices',
        'bookingServices.service',
        'bookingWorkers',
        'bookingWorkers.worker',
      ],
    });

    if (!booking) {
      throw new AppError(404, `Booking with ID ${bookingId} not found`);
    }

    return booking;
  }

  async deleteBooking(bookingId: string): Promise<void> {
    const booking = await this.bookingRepository.findOneBy({ id: bookingId });
    if (!booking) throw new AppError(400, 'Booking not found');
    await this.bookingServiceRepository.delete({ booking: { id: bookingId } });
    await this.bookingWorkerRepository.delete({ booking: { id: bookingId } });
    await this.bookingRepository.remove(booking);
  }

  async updateBooking(
    bookingId: string,
    updateData: Partial<Booking>,
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findOneBy({ id: bookingId });
    if (!booking) throw new AppError(400, 'Booking not found');
    Object.assign(booking, updateData);
    return await this.bookingRepository.save(booking);
  }

  private applyFilterCondition(queryBuilder: SelectQueryBuilder<Booking>, filters: BookingFilter) {
    const conditions = [
      { key: 'status', condition: 'booking.status = :status' },
      { key: 'vehicle_license_plate', condition: 'booking.vehicle_license_plate = :vehicle_license_plate', transform: (value: string) => `%${value}%` },
      { key: 'pickup_at', condition: 'DATE(booking.pickup_at) = DATE(:pickupAt)' },
      { key: 'created_at', condition: 'DATE(booking.created_at) = DATE(:createdAt)' },
    ];
  
    conditions.forEach(({ key, condition, transform }) => {
      if (filters[key as keyof BookingFilter]) {
        const value = transform ? transform(filters[key as keyof BookingFilter] as string) : filters[key as keyof BookingFilter];
        queryBuilder = queryBuilder.andWhere(condition, { [key]: value });
      }
    });
  
    return queryBuilder;
  }
  
  async getBookingsWithFilter(
    businessId: string,
    filters: BookingFilter = {},
    { page = 1, pageSize = 10, maxPageSize = 100 }: PaginationOptions = {}
  ): Promise<{ bookings: Booking[]; total: number }> {
    pageSize = Math.min(pageSize, maxPageSize);
  
    let queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .innerJoinAndSelect('booking.business', 'business')
      .where('business.id = :businessId', { businessId: businessId });
  
    // This line should apply named parameters for all conditions
    queryBuilder = this.applyFilterCondition(queryBuilder, filters);
  
    const total = await queryBuilder.getCount();
  
    const bookings = await queryBuilder
      .orderBy('booking.created_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
  
    return { bookings, total };
  }
  
}

export default new BookingManagementService();
