import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import { useLogin, useVerifyAccount } from '../hooks/useAuth';
import { LoginFormData } from '../types/authTypes';
import { Button, Alert } from '@mui/material';
import { FormField } from '../components/FormField';
import { FormContainer } from '../components/FormContainer';
import { emailValidation, passwordValidation } from '../utils/formValidations';

const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    mode: 'onSubmit',
  });
  const { login: loginUser, error: loginError } = useLogin();
  const location = useLocation();
  const successMessage = (location.state as { message?: string } | null)?.message;
  const verifyError = (location.state as { error?: string } | null)?.error;
  const token = new URLSearchParams(location.search).get('token') || '';
  const { resend } = useVerifyAccount(token);
  const [resentSuccess, setResentSuccess] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    await loginUser(data.email, data.password);
  };

  const handleResend = async () => {
    await resend();
    setResentSuccess(true);
  };

  const isExpiredToken = verifyError === 'Expired token';

  return (
    <FormContainer title="Login">
      {loginError && <Alert severity="error" sx={{ mb: 2 }}>{loginError}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
      {verifyError && !resentSuccess && (
        <>
          <Alert severity="error" sx={{ mb: 2 }}>{verifyError}</Alert>
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
        </>
      )}
      {resentSuccess && <Alert severity="success" sx={{ mb: 2 }}>New verification email sent, check your inbox</Alert>}
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