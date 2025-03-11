// frontend/src/pages/Success.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthContext } from '../contexts/AuthContext'; // Fixed import
import { Box, Typography, CircularProgress } from '@mui/material';

export function Success() {
  const navigate = useNavigate();
  const { loading } = useAuthContext();

  useEffect(() => {
    if (!loading) {
      toast.success('Purchase successful! Enjoy your premium features.');
      const timer = setTimeout(() => navigate('/dashboard'), 3000);
      return () => clearTimeout(timer);
    }
  }, [loading, navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      <Typography variant="h4">Purchase Successful!</Typography>
      <Typography variant="body1">Redirecting to dashboard...</Typography>
    </Box>
  );
}

export default Success;