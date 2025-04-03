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
    base_price: string;
    service_name_at_booking: string;
  }
  
  export interface Booking {
    id: string;
    created_at: string;
    pickup_at: string;
    status: string;
    vehicle_license_plate: string;
    business: Business;
    customer: Customer;
    bookingServices: BookingService[];
  }
  
  export interface Meta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  
  export interface BookingsResponse {
    status: string;
    data: Booking[];
    meta: Meta;
  }