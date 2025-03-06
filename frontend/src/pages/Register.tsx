import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useRegister } from '../hooks/useAuth';
import { RegisterFormData } from '../types/authTypes';
import { Button } from '@mui/material';
import { toast } from 'react-toastify';
import { FormField } from '../components/FormField';
import { FormContainer } from '../components/FormContainer';
import { nameValidation, emailValidation, passwordValidation } from '../utils/formValidations';

const Register = () => {
  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ mode: 'onSubmit' });
  const { register: registerUser, error } = useRegister();
  const navigate = useNavigate();
  const [registerSuccess, setRegisterSuccess] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      navigate('/'); // Redirect if already logged in
    }
  }, [navigate]);

  useEffect(() => {
    const alertMap = {
      error: [{ trigger: error, message: error }],
      success: [{ trigger: registerSuccess, message: 'Registration successful! Please check your email to verify your account.' }],
    };

    Object.entries(alertMap).forEach(([type, alerts]) => {
      alerts
        .filter(alert => alert.trigger)
        .forEach(alert => toast[type as 'error' | 'success'](alert.message));
    });
  }, [error, registerSuccess]);

  const onSubmit = async (data: RegisterFormData) => {
    await registerUser(data.name, data.email, data.password);
    setRegisterSuccess(true);
  };

  return (
    <FormContainer title="Register">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField
          register={formRegister('name', nameValidation)}
          error={errors.name}
          label="Name"
        />
        <FormField
          register={formRegister('email', emailValidation)}
          error={errors.email}
          label="Email"
          type="email"
        />
        <FormField
          register={formRegister('password', passwordValidation)}
          error={errors.password}
          label="Password"
          type="password"
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
        >
          Register
        </Button>
      </form>
    </FormContainer>
  );
};

export default Register;