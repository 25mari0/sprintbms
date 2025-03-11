import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@mui/material';
import { FormField } from '../components/FormField';
import { FormContainer } from '../components/FormContainer';
import { emailValidation, passwordValidation } from '../utils/formValidations';

interface LoginFormData {
  email: string;
  password: string;
}

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({ mode: 'onSubmit' });
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await login(data.email, data.password); // Now returns AxiosResponse
      const newAccessToken = response.headers['authorization']?.split('Bearer ')[1];
      if (newAccessToken) {
        localStorage.setItem('accessToken', newAccessToken);
      } else {
        throw new Error('No access token received');
      }
      navigate('/dashboard', { replace: true });
    } catch (error) {
      // Errors handled by api.ts
    }
  };

  return (
    <FormContainer title="Login">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField register={register('email', emailValidation)} error={errors.email} label="Email" type="email" />
        <FormField register={register('password', passwordValidation)} error={errors.password} label="Password" type="password" />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Login
        </Button>
      </form>
    </FormContainer>
  );
};

export default Login;