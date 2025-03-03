import React from 'react';
import { useForm } from 'react-hook-form';
import { useRegister } from '../hooks/useAuth';
import { RegisterFormData } from '../types/authTypes';
import { Button, Alert } from '@mui/material';
import { FormField } from '../components/FormField';
import { FormContainer } from '../components/FormContainer';
import { nameValidation, emailValidation, passwordValidation } from '../utils/formValidations';

const Register: React.FC = () => {
  const { register: formRegister, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    mode: 'onSubmit',
  });
  const { register: registerUser, error } = useRegister();

  const onSubmit = async (data: RegisterFormData) => {
    await registerUser(data.name, data.email, data.password);
  };

  return (
    <FormContainer title="Register">
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
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