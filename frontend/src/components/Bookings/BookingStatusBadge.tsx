import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import { BookingStatus } from '../../types/bookingTypes';
import { statusConfig } from '../../utils/bookingUtils';

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

const BookingStatusBadge = ({ status }: BookingStatusBadgeProps) => {
  const statusStyle = statusConfig[status] || {
    light: '#E0E0E0',
    dark: '#9E9E9E',
    text: '#616161'
  };

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        bgcolor: alpha(statusStyle.dark, 0.18),
        color: statusStyle.text,
        borderRadius: '8px',
        px: 1.5,
        py: 0.75,
      }}
    >
      <Typography variant="body2" fontWeight="medium">
        {status}
      </Typography>
    </Box>
  );
};

export default React.memo(BookingStatusBadge);
