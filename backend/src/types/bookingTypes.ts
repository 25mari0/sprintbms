// src/types/bookingTypes.ts
export interface BookingFilters {
  page?: number;          // Pagination: page number
  limit?: number;         // Pagination: items per page
  status?: string;        // Booking status (e.g., "confirmed", "pending")
  startDate?: string;     // ISO date string (e.g., "2023-10-01")
  endDate?: string;       // ISO date string (e.g., "2023-10-31")
  customerId?: string;    // Customer ID to filter bookings
  search?: string;        // Search term for license plate or customer name
}

export interface PaginatedResponse<T> {
  data: T[];              // Array of bookings
  meta: {
    total: number;        // Total number of bookings
    page: number;         // Current page
    limit: number;        // Items per page
    totalPages: number;   // Total pages available
  };
}