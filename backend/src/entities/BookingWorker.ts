import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Booking } from './Booking';
import { Worker } from './Worker';

@Entity()
export class BookingWorker {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Booking, (booking) => booking.bookingWorkers)
  @JoinColumn({ name: 'booking_id' })
  booking!: Booking;

  @ManyToOne(() => Worker, (worker) => worker.bookingWorkers)
  @JoinColumn({ name: 'worker_id' })
  worker!: Worker;
}
