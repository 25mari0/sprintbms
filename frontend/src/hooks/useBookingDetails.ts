import { useState, useEffect } from 'react';
import { get } from '../services/api';
import { toast } from 'react-toastify';
import { DetailedBooking } from '../types/bookingTypes';

export const useBookingDetails = (bookingId: string) => {
  const [details, setDetails] = useState<DetailedBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    get<DetailedBooking>(`/bookings/${bookingId}`)
      .then((response: any) => {
        if (response && response.status === 'success' && response.data) {
          setDetails(response.data as DetailedBooking);
        } else if (response && !response.status) {
          setDetails(response as DetailedBooking);
        } else {
          console.error('Failed to load booking details or unexpected response structure:', response);
          throw new Error('Invalid response structure for booking details.');
        }
      })
      .catch(() => {
        setError('Failed to load booking details.');
        toast.error('Failed to load booking details.');
      })
      .finally(() => setLoading(false));
  }, [bookingId]);

  return { details, loading, error };
};
