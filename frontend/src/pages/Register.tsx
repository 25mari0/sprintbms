import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@mui/material';
import { FormField } from '../components/FormField';
import { FormContainer } from '../components/FormContainer';
import { nameValidation, emailValidation, passwordValidation } from '../utils/formValidations';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({ mode: 'onSubmit' });
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      navigate('/');
    }
  }, [navigate]);

  const onSubmit = async (data: RegisterFormData) => {
    await registerUser(data.name, data.email, data.password); // api.ts handles toast/redirect
  };

  return (
    <FormContainer title="Register">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField register={register('name', nameValidation)} error={errors.name} label="Name" />
        <FormField register={register('email', emailValidation)} error={errors.email} label="Email" type="email" />
        <FormField register={register('password', passwordValidation)} error={errors.password} label="Password" type="password" />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Register
        </Button>
      </form>
    </FormContainer>
  );
};

export default Register;