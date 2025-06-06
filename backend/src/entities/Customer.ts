import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Business } from './Business';
import { Booking } from './Booking';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 15, nullable: true })
  phone!: string;

  @ManyToOne(() => Business, (business) => business.customers)
  @JoinColumn({ name: 'business_id' })
  business!: Business;

  @OneToMany(() => Booking, (booking) => booking.customer)
  bookings!: Booking[];
}
