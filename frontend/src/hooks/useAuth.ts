import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  validateToken,
  confirmAccount,
  resendVerification,
  login,
  register,
} from '../api/authApi';
import { handleApiError } from '../utils/errorHandler';
import { useAuth } from '../contexts/AuthContext';

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
      const apiError = handleApiError(err);
      navigate(`/login?token=${token}`, { state: { error: apiError.message } });
    }
  };

  const resend = async () => {
    try {
      await resendVerification(token);
      setStatus('resent');
      setError('');
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
    }
  };

  return { status, error, verifyToken, resend };
};

export const useLogin = () => {
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { setToken } = useAuth();

  const loginUser = async (email: string, password: string) => {
    setError('');
    try {
      const data = await login(email, password);
      setToken(data.accessToken);
      navigate('/');
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
    }
  };

  return { login: loginUser, error };
};

export const useRegister = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');

  const registerUser = async (
    name: string,
    email: string,
    password: string,
  ) => {
    setError('');
    try {
      const { message } = await register(name, email, password);
      navigate('/login', { state: { message } });
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
    }
  };

  return { register: registerUser, error };
};
