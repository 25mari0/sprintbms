import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Booking } from "./Booking";
import { Service } from "./Service";

@Entity()
export class BookingService {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Booking, (booking) => booking.bookingServices)
  @JoinColumn({ name: "booking_id" })
  booking!: Booking;

  @ManyToOne(() => Service, (service) => service.id)
  @JoinColumn({ name: "service_id" })
  service!: Service;
}
