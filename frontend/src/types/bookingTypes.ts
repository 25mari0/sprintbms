import { Meta } from ".";
import { WorkerUser } from "./workerTypes";

export interface Business {
    id: string;
    name: string;
    licenseExpirationDate: string;
    created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
}

export interface BookingService {
  id: number;
  charged_price: string;
  time_estimate: number;
  base_price: string;
  service_name_at_booking: string;
}

export interface BookingWorker {
  id: string;
  worker: WorkerUser;
}

export type BookingStatus = 'Pending' | 'Completed' | 'In Progress' | 'Cancelled';

export interface Booking {
  id: string;
  created_at: string;
  pickup_at: string;
  status: BookingStatus;
  vehicle_license_plate: string;
  charged_price: number;
  business: Business;
  customer: Customer;
  bookingServices: BookingService[];
}

export interface BookingsResponse {
  status: string;
  data?: Booking[];
  meta: Meta;
}

export interface DetailedBooking extends Booking {
  bookingServices: Array<BookingService & { service_name_at_booking: string }>;
  bookingWorkers: Array<BookingWorker>; 
}
