export const CACHE_CONFIG = {
  TTL: {
    BUSINESS: 3600,      // 1 hour
    SERVICES: 1800,      // 30 minutes
    CUSTOMERS: 1800,     // 30 minutes
    BOOKINGS: 300,       // 5 minutes (more dynamic)
    USER_SESSION: 86400, // 24 hours
    REFRESH_TOKEN: 2592000, // 30 days
  },
  PATTERNS: {
    BUSINESS: 'business:*',
    SERVICES: 'services:*',
    CUSTOMERS: 'customers:*',
    BOOKINGS: 'bookings:*',
  }
};