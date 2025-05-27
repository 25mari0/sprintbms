import React from 'react';
import { Stack, Typography, Box, Tooltip } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningIcon from '@mui/icons-material/Warning';
import { 
  formatBookingDate, 
  formatBookingTime, 
  getRelativeTime, 
  isTimeWarning 
} from '../../utils/bookingUtils';

interface PickupTimeDisplayProps {
  pickupAt: string;
  totalServiceTime: number;
}

const PickupTimeDisplay = ({ pickupAt, totalServiceTime }: PickupTimeDisplayProps) => {
  const showWarning = isTimeWarning(pickupAt, totalServiceTime);
  
  return (
    <Stack spacing={0.5}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <CalendarTodayIcon sx={{ fontSize: '0.9rem', color: '#E8ECEF' }} />
        <Typography variant="body2" sx={{ color: '#E8ECEF', fontWeight: 500 }}>
          {formatBookingDate(pickupAt)}
        </Typography>
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          color: showWarning ? 'warning.main' : 'text.secondary',
          pl: 0.25
        }}
      >
        <AccessTimeIcon sx={{ fontSize: '0.8rem' }} />
        <Typography variant="caption">
          {formatBookingTime(pickupAt)}
        </Typography>
        <Box
          component="span"
          sx={{
            width: '3px',
            height: '3px',
            borderRadius: '50%',
            bgcolor: 'currentColor',
            display: 'inline-block'
          }}
        />
        <Tooltip
          title={showWarning ? `Warning: Less than 50% of required service time (${totalServiceTime} min) remaining` : ''}
          arrow
        >
          <Stack direction="row" alignItems="center" spacing={0.5}>
            {showWarning && <WarningIcon sx={{ fontSize: '0.9rem' }} />}
            <Typography variant="caption">
              {getRelativeTime(pickupAt)}
            </Typography>
          </Stack>
        </Tooltip>
      </Stack>
    </Stack>
  );
};

export default React.memo(PickupTimeDisplay);
