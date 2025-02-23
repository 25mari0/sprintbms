import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { login } from '../services/authService';
import { handleApiError } from '../utils/errorHandler';
import { emailValidation, passwordValidation } from '../utils/formValidations';
import { LoginFormData } from '../types/authTypes';

const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    mode: 'onSubmit',
  });
  const [error, setError] = useState('');

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    try {
      await login(data.email, data.password);
      window.location.href = '/';
    } catch (err: unknown) {
      setError(handleApiError(err));
    }
  };

  return (
    <div>
      <h1>Login</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register('email', emailValidation)}
          placeholder="Email"
          type="email"
        />
        {errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}
        <input
          {...register('password', passwordValidation)}
          placeholder="Password"
          type="password"
        />
        {errors.password && <p style={{ color: 'red' }}>{errors.password.message}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;