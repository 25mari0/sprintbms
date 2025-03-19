import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Box, Button, Typography } from '@mui/material';
import { post } from '../services/api';

export default function VerifyAccount() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [isExpired, setIsExpired] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        toast.error('No verification token provided');
        navigate('/login');
        return;
      }

      try {
        const response = await post(`/client/account-verification/verify?token=${token}`);
        if (response.status === 'success') {
          setIsVerified(true);
          toast.success('Account verified! Please log in.');
          // api.ts will handle redirect if provided
        }
      } catch (error: any) {
        if (error.response?.status === 400) {
          setIsExpired(true);
          toast.error('Verification token has expired');
        } else {
          toast.error('Invalid verification token');
          navigate('/login');
        }
      }
    };

    verifyToken();
  }, [token, navigate]);

  const handleResendVerification = async () => {
    try {
      await post(`/client/account-verification/resend?token=${token}`);
      toast.success('Verification link resent to your email');
    } catch (error) {
      toast.error('Failed to resend verification email');
    }
  };

  if (isVerified) {
    return (
      <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 2 }}>
        <Typography variant="h6">Account Verified</Typography>
        <Typography variant="body1">Your account has been successfully verified. Please log in.</Typography>
        <Button variant="contained" onClick={() => navigate('/login')} sx={{ mt: 2 }}>
          Go to Login
        </Button>
      </Box>
    );
  }

  if (isExpired) {
    return (
      <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 2 }}>
        <Typography variant="h6">Token Expired</Typography>
        <Typography variant="body1">Your verification token has expired. Click below to resend the verification email.</Typography>
        <Button variant="contained" onClick={handleResendVerification} sx={{ mt: 2 }}>
          Resend Verification Email
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h6">Verifying your account...</Typography>
    </Box>
  );
}