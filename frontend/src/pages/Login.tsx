import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLogin, useVerifyAccount } from '../hooks/useAuth';
import { LoginFormData } from '../types/authTypes';
import { Button } from '@mui/material';
import { toast } from 'react-toastify';
import { FormField } from '../components/FormField';
import { FormContainer } from '../components/FormContainer';
import { emailValidation, passwordValidation } from '../utils/formValidations';

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ mode: 'onSubmit' });
  const { login: loginUser, error: loginError } = useLogin();
  const location = useLocation();
  const navigate = useNavigate();
  const successMessage = (location.state as { message?: string } | null)
    ?.message;
  const sessionError = (location.state as { error?: string } | null)?.error;
  const token = new URLSearchParams(location.search).get('token') || '';
  const { resend } = useVerifyAccount(token);
  const [resentSuccess, setResentSuccess] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const alertMap = {
      error: [
        { trigger: sessionError, message: sessionError },
        { trigger: loginError, message: loginError },
      ],
      success: [
        { trigger: successMessage, message: successMessage },
        {
          trigger: resentSuccess,
          message: 'New verification email sent, check your inbox',
        },
      ],
    };

    Object.entries(alertMap).forEach(([type, alerts]) => {
      alerts
        .filter((alert) => alert.trigger)
        .forEach((alert) => toast[type as 'error' | 'success'](alert.message));
    });
  }, [sessionError, successMessage, loginError, resentSuccess]);

  const onSubmit = async (data: LoginFormData) => {
    await loginUser(data.email, data.password);
  };

  const handleResend = async () => {
    await resend();
    setResentSuccess(true);
  };

  const isExpiredToken = sessionError === 'Expired token';

  return (
    <FormContainer title="Login">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField
          register={register('email', emailValidation)}
          error={errors.email}
          label="Email"
          type="email"
        />
        <FormField
          register={register('password', passwordValidation)}
          error={errors.password}
          label="Password"
          type="password"
        />
        {isExpiredToken && (
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 1, mb: 2 }}
            onClick={handleResend}
          >
            Resend Verification
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
        >
          Login
        </Button>
      </form>
    </FormContainer>
  );
};

export default Login;
