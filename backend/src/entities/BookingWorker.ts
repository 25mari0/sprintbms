import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Booking } from './Booking';
import { User } from './User';

@Entity()
export class BookingWorker {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Booking, (booking) => booking.bookingWorkers)
  @JoinColumn({ name: 'booking_id' })
  booking!: Booking;

  @ManyToOne(() => User, (user) => user.bookingWorkers)
  @JoinColumn({ name: 'worker_id' })
  worker!: User;
}
