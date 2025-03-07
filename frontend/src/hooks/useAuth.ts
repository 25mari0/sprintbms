import { useCallback } from 'react';
import { post } from '../services/api';
import { AuthResponse } from '../types/authTypes';


export const useAuth = () => {
  const login = useCallback(async (email: string, password: string) => {
    return await post<AuthResponse>('/client/login', { email, password });
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    return await post<AuthResponse>('/client/register', { name, email, password });
  }, []);

  const verifyAccount = useCallback(async (token: string) => {
    return await post<AuthResponse>(`/client/account-verification/verify?token=${token}`);
  }, []);

  const resendVerification = useCallback(async (token: string) => {
    return await post<AuthResponse>(`/client/account-verification/resend?token=${token}`);
  }, []);

  return { login, register, verifyAccount, resendVerification };
};