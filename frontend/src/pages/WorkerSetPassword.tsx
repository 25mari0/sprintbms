import { useState, useEffect } from 'react';
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
import { toast } from 'react-toastify'; // For manual toast in !token case

const WorkerSetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [verifyingToken, setVerifyingToken] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        toast.error('No token provided');
        setTimeout(() => navigate('/login'), 1000); // Redirect after toast
        return; // Keep verifyingToken true, spinner stays on
      }

      try {
        const response = await get<{ token: string }>(
          `/worker/verify-reset-token?token=${token}`,
          undefined,
          { disableToast: false } // Let api.ts handle toasts
        );
        console.log('Token verification response:', response);
        if (response.status === 'success') {
          setVerifyingToken(false); // Stop spinner, show form
        } else {
          // Error case: api.ts will show the toast, keep spinner, then navigate
          setTimeout(() => navigate('/login'), 1000); // Redirect after toast
        }
      } catch (err: any) {
        console.error('Token verification error:', err.response?.data || err.message);
        // Error will be toasted by api.ts, keep spinner, then navigate
        setTimeout(() => navigate('/login'), 1000);
      }
    };

    verifyToken();
  }, [token, navigate]);

  // Handle form submission
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
      console.log('Set password response:', response);
      if (response.status === 'success') {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(response.message || 'Failed to set password');
      }
    } catch (err: any) {
      console.error('Set password error:', err.response?.data || err.message);
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormInvalid = !password || !confirmPassword || password.length < 8 || password !== confirmPassword;

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

  // If we reach here, tokenValid is true and verifyingToken is false
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