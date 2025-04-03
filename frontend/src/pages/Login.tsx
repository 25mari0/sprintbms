import { useForm } from 'react-hook-form';
import { Button, Box } from '@mui/material';
import { FormContainer } from '../components/FormContainer';
import { FormField } from '../components/FormField';
import { post } from '../services/api';
import { useAuthStore, UserData } from '../stores/authStore';
import { emailValidation, passwordValidation } from '../utils/formValidations';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const { setUser, setIsAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [expiredToken, setExpiredToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ mode: 'onBlur' });

  // Check route state for expired token
  useEffect(() => {
    if (location.state?.verification === 'expired' && location.state?.token) {
      setExpiredToken(location.state.token);
    }
  }, [location.state]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await post<{ responseData: UserData }>('/client/login', data);
      if (response.status === 'success') {
        setUser(response.data!.responseData);
        setIsAuthenticated(true);
      }
    } catch (error: any) {
      console.error(error.response?.data?.message || 'Login failed');
    }
  };

  const handleResendVerification = async () => {
    if (!expiredToken) return;
    try {
      await post(`/client/account-verification/resend?token=${expiredToken}`);
      setExpiredToken(null); // Clear token after successful resend
    } catch {
      toast.error('Failed to resend verification email.');
    }
  };

  return (
    <FormContainer title="Login">
      {expiredToken && (
        <Box   sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleResendVerification}
            disabled={isSubmitting}
          >
            Resend Verification Email
          </Button>
        </Box>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField
          register={register('email', emailValidation)}
          error={errors.email}
          label="Email"
          disabled={isSubmitting}
        />
        <FormField
          register={register('password', passwordValidation)}
          error={errors.password}
          label="Password"
          type="password"
          disabled={isSubmitting}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isSubmitting}
          sx={{ mt: 2, borderRadius: 2, boxShadow: 2 }}
          >
          Login
        </Button>
        <Button
          variant="text"
          fullWidth
          onClick={() => navigate('/register')}
          disabled={isSubmitting}
          sx={{ mt: 1, borderRadius: 2, boxShadow: 2 }}
          >
          Need an account? Register
        </Button>
      </form>
    </FormContainer>
  );
}