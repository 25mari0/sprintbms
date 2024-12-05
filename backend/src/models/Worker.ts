import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Business } from "../models/Business";
import { BookingWorker } from "../models/BookingWorker";

@Entity()
export class Worker {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @ManyToOne(() => Business, (business) => business.workers)
  @JoinColumn({ name: "business_id" })
  business!: Business;

  @OneToMany(() => BookingWorker, (bookingWorker) => bookingWorker.worker)
  bookingWorkers!: BookingWorker[];
}
