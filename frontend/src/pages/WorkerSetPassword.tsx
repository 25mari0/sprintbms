import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { get, post } from '../services/api';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import { toast } from 'react-toastify';
import { FormContainer }  from '../components/FormContainer';
import { FormField } from '../components/FormField';
import { passwordValidation } from '../utils/userValidations';

interface FormData {
  password: string;
  confirmPassword: string;
}

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
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Navigate to /login if token is invalid
  useEffect(() => {
    if (!verifyingToken && !tokenValid) {
      navigate('/login', { replace: true });
    }
  }, [verifyingToken, tokenValid, navigate]);

  // Watch password to compare with confirmPassword
  const password = watch('password');

  const onSubmit = async (data: FormData) => {
    setError(null);

    // Additional validation for confirmPassword
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await post<void>(
        '/worker/set-password',
        { password: data.password, token },
        undefined,
        { disableToast: true }
      );
      if (response.status === 'success') {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(response.message || 'Failed to set password');
      }
    } catch {
      setError('An error occurred. Please try again.');
    }
  };

  // Show loading spinner while verifying token or redirecting
  if (verifyingToken || !tokenValid) {
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
    <FormContainer title="Set Your Password">
      <form onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <FormField
          register={register('password', passwordValidation)}
          error={errors.password}
          label="Password"
          type="password"
          disabled={isSubmitting}
        />
        <FormField
          register={register('confirmPassword', {
            required: 'Confirm Password is required',
            validate: (value) =>
              value === password || 'Passwords do not match',
          })}
          error={errors.confirmPassword}
          label="Confirm Password"
          type="password"
          disabled={isSubmitting}
        />
        <Box sx={{ mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={24} sx={{ color: '#A8C7E2' }} />
            ) : (
              'Set Password'
            )}
          </Button>
        </Box>
      </form>
    </FormContainer>
  );
};

export default WorkerSetPassword;