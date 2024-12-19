import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Business } from './Business';
import { Customer } from './Customer';
import { BookingService } from './BookingService';
import { BookingWorker } from './BookingWorker';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Business, (business) => business.bookings)
  @JoinColumn({ name: 'business_id' })
  business!: Business;

  @ManyToOne(() => Customer, (customer) => customer.bookings)
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;

  @Column({ type: 'timestamp' })
  booking_date!: Date;

  @Column({
    type: 'enum',
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending',
  })
  status!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_price!: number;

  @OneToMany(() => BookingService, (bookingService) => bookingService.booking)
  bookingServices!: BookingService[];

  @OneToMany(() => BookingWorker, (bookingWorker) => bookingWorker.booking)
  bookingWorkers!: BookingWorker[];
}
