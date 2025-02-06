import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Customer } from './Customer';
import { Booking } from './Booking';
import { User } from './User';

@Entity()
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ type: 'timestamp', nullable: true })
  licenseExpirationDate?: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @OneToMany(() => Customer, (customer) => customer.business)
  customers!: Customer[];

  @OneToMany(() => Booking, (booking) => booking.business)
  bookings!: Booking[];

  @OneToMany(() => User, (user) => user.business)
  users!: User[];
}
