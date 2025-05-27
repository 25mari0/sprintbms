import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { Booking } from './Booking';
import { Service } from './Service';

@Entity()
export class BookingService {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Booking, (booking) => booking.bookingServices)
  @JoinColumn({ name: 'booking_id' })
  booking!: Booking;

  @ManyToOne(() => Service, (service) => service.id, { nullable: true })
  @JoinColumn({ name: 'service_id' })
  service?: Service;

  //the value which the customer paid, can change due to discounts or vehicle complexity
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  charged_price!: number;

  //time estimate in minutes
  @Column({ type: 'int' })
  time_estimate!: number;

  //price of the service at the time of booking
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  base_price!: number; 

  //show this on the front end, not the service.name
  //name of the service at the time of booking
  @Column({ length: 100 })
  service_name_at_booking!: string;
}
