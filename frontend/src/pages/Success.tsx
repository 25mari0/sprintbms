import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Box, Typography } from '@mui/material';

export function Success() {
  const navigate = useNavigate();

  useEffect(() => {
    toast.success('Purchase successful! Enjoy your premium features.');
    const timer = setTimeout(() => navigate('/bookings'), 3000);
    return () => clearTimeout(timer);
  }, [navigate]);


  return (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      <Typography variant="h4">Purchase Successful!</Typography>
      <Typography variant="body1">Redirecting to dashboard...</Typography>
    </Box>
  );
}

export default Success;