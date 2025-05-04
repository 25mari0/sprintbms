import { useForm } from 'react-hook-form';
import { Box } from '@mui/material';
import { FormContainer } from '../components/FormContainer';
import { TextBox } from '../components/TextBox';
import { CustomButton } from '../components/CustomButton';
import { post } from '../services/api';
import { useAuthStore, UserData } from '../stores/authStore';
import { emailValidation, passwordValidation } from '../utils/userValidations';
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
      setExpiredToken(null);
    } catch {
      toast.error('Failed to resend verification email.');
    }
  };

  return (
    <FormContainer title="Login">
      {expiredToken && (
        <Box sx={{ mb: 2 }}>
          <CustomButton
            onClick={handleResendVerification}
            disabled={isSubmitting}
            fullWidth
            sx={{ height: '40px', fontSize: '0.875rem', mb: 1, width: '100%' }}
          >
            Resend Verification Email
          </CustomButton>
        </Box>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextBox
          label="Email"
          register={register('email', emailValidation)}
          error={errors.email}
          disabled={isSubmitting}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextBox
          label="Password"
          type="password"
          register={register('password', passwordValidation)}
          error={errors.password}
          disabled={isSubmitting}
          fullWidth
          sx={{ mb: 2 }}
        />
        <CustomButton
          type="submit"
          disabled={isSubmitting}
          sx={{ height: '40px', fontSize: '0.875rem', mb: 1, display: 'flex', width: '100%' }}
        >
          Login
        </CustomButton>
        <CustomButton
          customVariant="secondary"
          variant='text'
          onClick={() => navigate('/register')}
          disabled={isSubmitting}
          sx={{ height: '40px', fontSize: '0.875rem', display: 'flex', width: '100%'}}
        >
          Need an account? Register
        </CustomButton>
      </form>
    </FormContainer>
  );
}