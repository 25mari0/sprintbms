// src/utils/bookingUtils.ts
import { format, formatDistanceToNow, isPast, differenceInMinutes } from 'date-fns';
import { BookingService, BookingStatus } from '../types/bookingTypes';

// Status configuration for consistent styling
export const statusConfig: Record<BookingStatus, { light: string; dark: string; text: string }> = {
  Pending: { light: '#FFF8E1', dark: '#AA974F', text: '#faefa0' },
  Completed: { light: '#E8F5E9', dark: '#4CAF50', text: '#2E7D32' },
  'In Progress': { light: '#E3F2FD', dark: '#2196F3', text: '#1565C0' },
  Cancelled: { light: '#FFEBEE', dark: '#F44336', text: '#C62828' },
};

// Format date for display
export const formatBookingDate = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'MMM dd, yyyy');
};

// Format time for display
export const formatBookingTime = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'HH:mm');
};

// Get relative time (e.g., "2 hours from now")
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  return isPast(date) ? 'Past pickup time' : formatDistanceToNow(date, { addSuffix: true });
};

// Check if pickup time is approaching with insufficient time
export const isTimeWarning = (pickupDate: string, totalServiceTime: number): boolean => {
  const date = new Date(pickupDate);
  const minutesRemaining = differenceInMinutes(date, new Date());
  return minutesRemaining > 0 && minutesRemaining < totalServiceTime * 0.5;
};

// Calculate total price from booking services
export const calculateTotalPrice = (services: BookingService[]): number => {
  return services.reduce((total, service) => total + Number(service.charged_price), 0);
};

// Calculate total base price from booking services
export const calculateTotalBasePrice = (services: BookingService[]): number => {
  return services.reduce((total, service) => total + Number(service.base_price), 0);
};

// Calculate total service time in minutes
export const calculateTotalServiceTime = (services: BookingService[]): number => {
  return services.reduce((total, service) => total + Number(service.time_estimate), 0);
};

// Calculate discount percentage
export const calculateDiscountPercentage = (basePrice: number, chargedPrice: number): number => {
  return basePrice > 0 ? ((basePrice - chargedPrice) / basePrice) * 100 : 0;
};

// Format price with currency symbol
export const formatPrice = (price: number): string => {
  return `€${price.toFixed(2)}`;
};
