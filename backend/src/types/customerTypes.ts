export interface CustomerFilters {
    page?: number;          // Pagination: page number
    limit?: number;         // Pagination: items per page
    search?: string;        // Search term for customer name or email
    businessId?: string;    // Business ID for filtering customers by business
  }