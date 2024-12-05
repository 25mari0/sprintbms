import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Worker } from "../models/Worker";
import { Customer } from "../models/Customer";
import { Booking } from "../models/Booking";

@Entity()
export class Business {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ default: true })
  active!: boolean;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at!: Date;

  @OneToMany(() => Worker, (worker) => worker.business)
  workers!: Worker[];

  @OneToMany(() => Customer, (customer) => customer.business)
  customers!: Customer[];

  @OneToMany(() => Booking, (booking) => booking.business)
  bookings!: Booking[];
}
