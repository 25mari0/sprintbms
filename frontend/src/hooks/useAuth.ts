import { useCallback } from 'react';
import { post } from '../services/api';
import { AuthResponse } from '../types';
import { useNavigation } from './useNavigation';
import {
  LOGOUT_SUCCESS_MESSAGE,
  LOGOUT_FAILURE_MESSAGE,
} from '../constants/routes';
import { handleApiError } from '../utils/errorHandler';

export const useAuth = () => {
  const { navigateWithToast } = useNavigation();

  const login = useCallback(
    async (email: string, password: string) => {
      return await post<AuthResponse>('/client/login', { email, password });
    },
    []
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      return await post<AuthResponse>('/client/register', { name, email, password });
    },
    []
  );

  const verifyAccount = useCallback(
    async (token: string) => {
      return await post<AuthResponse>(`/client/account-verification/verify?token=${token}`);
    },
    []
  );

  const resendVerification = useCallback(
    async (token: string) => {
      return await post<AuthResponse>(`/client/account-verification/resend?token=${token}`);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await post('/client/logout');
      localStorage.removeItem('accessToken');
      navigateWithToast('/login', LOGOUT_SUCCESS_MESSAGE, { replace: true });
    } catch (error) {
      handleApiError(error, 'Logout failed');
      localStorage.removeItem('accessToken');
      navigateWithToast('/login', LOGOUT_FAILURE_MESSAGE, { replace: true });
    }
  }, [navigateWithToast]);

  return { login, register, verifyAccount, resendVerification, logout };
};