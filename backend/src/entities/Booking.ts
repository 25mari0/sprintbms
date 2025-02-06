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
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Business, (business) => business.bookings)
  @JoinColumn({ name: 'business_id' })
  business!: Business;

  @ManyToOne(() => Customer, (customer) => customer.bookings)
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;

  @Column({ type: 'timestamp' })
  created_at!: Date;

  //expected completion date and time, informed to the customer
  @Column({ type: 'timestamp' })
  pickup_at!: Date;

  @Column({
    type: 'enum',
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending',
  })
  status!: string;

  @Column({ type: 'text' })
  vehicle_license_plate!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_price!: number;

  @OneToMany(() => BookingService, (bookingService) => bookingService.booking)
  bookingServices!: BookingService[];

  @OneToMany(() => BookingWorker, (bookingWorker) => bookingWorker.booking)
  bookingWorkers!: BookingWorker[];
}
