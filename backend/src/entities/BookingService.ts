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

  @ManyToOne(() => Service, (service) => service.id)
  @JoinColumn({ name: 'service_id' })
  service!: Service;

  //the value which the customer paid, can change due to discounts or vehicle complexity
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  charged_price!: number;

  //the base price of the service at the time of booking
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  base_price!: number; 
}
