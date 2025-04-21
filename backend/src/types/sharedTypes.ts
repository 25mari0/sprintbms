export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  maxPageSize?: number; // Limit the maximum number of items per page
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