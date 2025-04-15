import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { get, post } from '../services/api';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { LockRounded } from '@mui/icons-material';
import { toast } from 'react-toastify';

const useVerifyToken = (token: string) => {
  const [verifyingToken, setVerifyingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  useMemo(() => {
    const verifyToken = async () => {
      if (!token) {
        toast.error('No token provided');
        setVerifyingToken(false);
        return;
      }

      try {
        const response = await get<{ token: string }>(
          `/worker/verify-reset-token?token=${token}`,
          undefined,
          { disableToast: false }
        );
        if (response.status === 'success') {
          setTokenValid(true);
        }
      } catch {
        // Error toast is handled by api.ts (disableToast: false)
      } finally {
        setVerifyingToken(false);
      }
    };

    verifyToken();
  }, [token]);

  return { verifyingToken, tokenValid };
};

const WorkerSetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const { verifyingToken, tokenValid } = useVerifyToken(token);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [redirecting, setRedirecting] = useState(false); // New state for redirect loading
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Navigate to /login if token is invalid, with a 1-second delay for toast visibility
  useEffect(() => {
    if (!verifyingToken && !tokenValid) {
      setRedirecting(true); // Show loading spinner during redirect
      navigate('/login', { replace: true });
    }
  }, [verifyingToken, tokenValid, navigate]);

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setSubmitting(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setSubmitting(false);
      return;
    }

    try {
      const response = await post<void>(
        '/worker/set-password',
        { password, token },
        undefined,
        { disableToast: true }
      );
      if (response.status === 'success') {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(response.message || 'Failed to set password');
      }
    } catch (err: any) {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormInvalid = !password || !confirmPassword || password.length < 8 || password !== confirmPassword;

  // Show loading spinner while verifying token
  if (verifyingToken) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: '#121212',
        }}
      >
        <CircularProgress sx={{ color: '#4A90E2' }} />
      </Box>
    );
  }

  // Show loading spinner while redirecting to /login
  if (!tokenValid || redirecting) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: '#121212',
        }}
      >
        <CircularProgress sx={{ color: '#4A90E2' }} />
      </Box>
    );
  }

  if (success) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: '#121212',
          p: 3,
        }}
      >
        <Box sx={{ maxWidth: 400, width: '100%' }}>
          <Alert severity="success">
            Password set successfully. Redirecting to login...
          </Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: '#121212',
        p: 3,
      }}
    >
      <Box
        sx={{
          maxWidth: 400,
          width: '100%',
          bgcolor: '#1E1E1E',
          p: 4,
          borderRadius: '8px',
          border: '1px solid #3A3A3A',
          boxShadow: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{ color: '#E3F2FD', mb: 3, textAlign: 'center' }}
        >
          Set Your Password
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          InputLabelProps={{ style: { color: '#A8C7E2' } }}
          sx={{
            input: { color: '#E3F2FD' },
            '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#3A3A3A' } },
          }}
          error={!!password && password.length < 8}
          helperText={password && password.length < 8 ? 'Minimum 8 characters' : ''}
          InputProps={{
            startAdornment: <LockRounded sx={{ color: '#A8C7E2', mr: 1 }} />,
          }}
          aria-label="New password"
        />
        <TextField
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fullWidth
          margin="normal"
          InputLabelProps={{ style: { color: '#A8C7E2' } }}
          sx={{
            input: { color: '#E3F2FD' },
            '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#3A3A3A' } },
          }}
          error={!!confirmPassword && password !== confirmPassword}
          helperText={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : ''}
          InputProps={{
            startAdornment: <LockRounded sx={{ color: '#A8C7E2', mr: 1 }} />,
          }}
          aria-label="Confirm new password"
        />
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={submitting || isFormInvalid}
            sx={{ borderRadius: '8px', minWidth: 120 }}
            aria-label="Set password"
          >
            {submitting ? <CircularProgress size={24} sx={{ color: '#A8C7E2' }} /> : 'Set Password'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default WorkerSetPassword;