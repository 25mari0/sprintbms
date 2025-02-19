import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
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

  @CreateDateColumn()
  created_at!: Date;

  //expected completion date and time, informed to the customer
  @Column({ type: 'timestamp' })
  pickup_at!: Date;

  @Column({
    type: 'enum',
    enum: ['Pending', 'In Progress', 'Awaiting Customer', 'Completed', 'Cancelled'],
    default: 'Pending',
  })
  status!: string;

  @Column({ type: 'text' })
  vehicle_license_plate!: string;

  @OneToMany(() => BookingService, (bookingService) => bookingService.booking)
  bookingServices!: BookingService[];

  @OneToMany(() => BookingWorker, (bookingWorker) => bookingWorker.booking)
  bookingWorkers!: BookingWorker[];

  //add function to calculate the total price of a booking
  //based on the service prices (this is stored on the BookingService entity as charged_price)
  calculateTotalPrice(): number {
    return this.bookingServices.reduce((acc, service) => acc + service.charged_price, 0);
  }

}

