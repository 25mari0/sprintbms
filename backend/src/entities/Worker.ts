import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Business } from './Business';
import { BookingWorker } from './BookingWorker';

@Entity()
export class Worker {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @ManyToOne(() => Business, (business) => business.workers)
  @JoinColumn({ name: 'business_id' })
  business!: Business;

  @OneToMany(() => BookingWorker, (bookingWorker) => bookingWorker.worker)
  bookingWorkers!: BookingWorker[];
}
