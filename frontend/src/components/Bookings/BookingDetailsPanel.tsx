import React from 'react';
import {
  Box,
  Typography,
  Stack,
  CircularProgress,
  alpha
} from '@mui/material';
import { useBookingDetails } from '../../hooks/useBookingDetails';
import { 
  calculateTotalPrice, 
  calculateTotalBasePrice, 
  calculateTotalServiceTime,
  calculateDiscountPercentage,
  formatPrice
} from '../../utils/bookingUtils';

interface BookingDetailsPanelProps {
  bookingId: string;
}

const BookingDetailsPanel = ({ bookingId }: BookingDetailsPanelProps) => {
  const { details, loading, error } = useBookingDetails(bookingId);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !details) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error || 'No details available.'}</Typography>
      </Box>
    );
  }

  const totalCharged = calculateTotalPrice(details.bookingServices);
  const totalBase = calculateTotalBasePrice(details.bookingServices);
  const totalDiscount = totalBase - totalCharged;
  const totalEstimatedTime = calculateTotalServiceTime(details.bookingServices);

  return (
    <Box sx={{ margin: 1, p: 2, bgcolor: alpha('#000000', 0.1), borderRadius: '8px' }}>
      <Typography variant="h6" gutterBottom component="div" sx={{ color: '#E8ECEF' }}>
        Booking Details
      </Typography>
      <Stack spacing={2}>
        {/* Customer Section */}
        <Box>
          <Typography variant="subtitle1" sx={{ color: '#A8C7E2' }}>Customer</Typography>
          {details.customer ? (
            <>
              <Typography>Name: {details.customer.name}</Typography>
              <Typography>Phone: {details.customer.phone || 'N/A'}</Typography>
            </>
          ) : (
            <Typography>Customer data not available.</Typography>
          )}
        </Box>

        {/* Services Section */}
        <Box>
          <Typography variant="subtitle1" sx={{ color: '#A8C7E2' }}>Services</Typography>
          {details.bookingServices && details.bookingServices.length > 0 ? (
            details.bookingServices.map(bs => (
              <Box 
                key={bs.id || `service-${Math.random()}`} 
                sx={{ mb: 1, p: 1, border: '1px solid #2A2A2A', borderRadius: '4px' }}
              >
                <Typography>Name: {bs.service_name_at_booking}</Typography>
                <Typography>
                  Charged: {formatPrice(parseFloat(bs.charged_price))} 
                  (Base: {formatPrice(parseFloat(bs.base_price))})
                </Typography>
                <Typography>Time Estimate: {bs.time_estimate} min</Typography>
              </Box>
            ))
          ) : (
            <Typography>No services for this booking.</Typography>
          )}
          <Typography variant="body2" sx={{ mt:1, fontWeight: 'bold' }}>
            Total Service Time: {totalEstimatedTime} min
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            Total Charged: {formatPrice(totalCharged)}
          </Typography>
          {totalDiscount > 0 && (
            <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold' }}>
              Total Discount: {formatPrice(totalDiscount)} 
              ({calculateDiscountPercentage(totalBase, totalCharged).toFixed(0)}% off)
            </Typography>
          )}
        </Box>

        {/* Workers Section */}
        <Box>
          <Typography variant="subtitle1" sx={{ color: '#A8C7E2' }}>Assigned Workers</Typography>
          {details.bookingWorkers && details.bookingWorkers.length > 0 ? (
            details.bookingWorkers.map((bw, index) => {
              if (bw && bw.worker) {
                const key = `worker-${bw.worker.id}-${index}`;
                return (
                  <Typography key={key}>
                    {bw.worker.name} ({bw.worker.email})
                  </Typography>
                );
              }
              return <Typography key={`worker-error-${index}`}>Worker data incomplete.</Typography>;
            })
          ) : (
            <Typography>No workers assigned.</Typography>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default React.memo(BookingDetailsPanel);
