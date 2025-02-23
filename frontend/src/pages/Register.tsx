import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { register } from '../services/authService';
import { handleApiError } from '../utils/errorHandler';
import { nameValidation, emailValidation, passwordValidation } from '../utils/formValidations';
import { RegisterFormData } from '../types/authTypes';

const Register: React.FC = () => {
  const { register: formRegister, handleSubmit, formState: { errors }, reset } = useForm<RegisterFormData>({
    mode: 'onSubmit',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onSubmit = async (data: RegisterFormData) => {
    setError('');
    setSuccess('');
    try {
      const { message } = await register(data.name, data.email, data.password);
      setSuccess(message);
      reset();
    } catch (err: unknown) {
      setError(handleApiError(err));
    }
  };

  return (
    <div>
      <h1>Register</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          {...formRegister('name', nameValidation)}
          placeholder="Name"
        />
        {errors.name && <p style={{ color: 'red' }}>{errors.name.message}</p>}
        <input
          {...formRegister('email', emailValidation)}
          placeholder="Email"
          type="email"
        />
        {errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}
        <input
          {...formRegister('password', passwordValidation)}
          placeholder="Password"
          type="password"
        />
        {errors.password && <p style={{ color: 'red' }}>{errors.password.message}</p>}
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;