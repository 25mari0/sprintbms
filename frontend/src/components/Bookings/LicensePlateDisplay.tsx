import React from 'react';
import { Box, Typography } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

interface LicensePlateDisplayProps {
  licensePlate: string;
}

const LicensePlateDisplay = ({ licensePlate }: LicensePlateDisplayProps) => {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        bgcolor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        px: 1.5,
        py: 0.75,
      }}
    >
      <DirectionsCarIcon sx={{ mr: 1, fontSize: '1.2rem', color: '#E8ECEF' }} />
      <Typography variant="body2" sx={{ color: '#E8ECEF', fontWeight: 500 }}>
        {licensePlate}
      </Typography>
    </Box>
  );
};

export default React.memo(LicensePlateDisplay);
