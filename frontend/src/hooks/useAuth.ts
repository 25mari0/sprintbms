import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../types/authTypes';
import { validateToken, confirmAccount, resendVerification, login, register } from '../api/authApi';

export const useVerifyAccount = (token: string) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'valid' | 'expired' | 'resent' | ''>('');
  const [error, setError] = useState<string>('');

  const verifyToken = async () => {
    if (!token) {
      navigate('/login', { state: { error: 'No token provided' } });
      return;
    }

    try {
      const result = await validateToken(token);
      if (result.status === 'success') {
        const response = await confirmAccount(token);
        navigate('/login', { state: { message: response.message } });
      } else {
        navigate(`/login?token=${token}`, { state: { error: result.message } });
      }
    } catch (err) {
      const apiError = err as ApiError;
      navigate(`/login?token=${token}`, { state: { error: apiError.message || 'Failed to validate token' } });

    }
  };

  const resend = async () => {
    try {
      await resendVerification(token);
      setStatus('resent');
      setError('');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to resend verification');
    }
  };

  return { status, error, verifyToken, resend };
};

export const useLogin = () => {
  const [error, setError] = useState<string>('');

  const loginUser = async (email: string, password: string) => {
    setError('');
    try {
      await login(email, password);
      window.location.href = '/';
    } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || 'Login failed');
    }
  };

  return { login: loginUser, error };
};

export const useRegister = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');

  const registerUser = async (name: string, email: string, password: string) => {
    setError('');
    try {
      const { message } = await register(name, email, password);
      navigate('/login', { state: { message } }); // Pass message to /login
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Registration failed');
    }
  };

  return { register: registerUser, error };
};