import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Worker } from './Worker';
import { Customer } from './Customer';
import { Booking } from './Booking';

@Entity()
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ default: true })
  active!: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @OneToMany(() => Worker, (worker) => worker.business)
  workers!: Worker[];

  @OneToMany(() => Customer, (customer) => customer.business)
  customers!: Customer[];

  @OneToMany(() => Booking, (booking) => booking.business)
  bookings!: Booking[];
}
