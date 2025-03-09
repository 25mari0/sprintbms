import { useCallback } from 'react';
import { post } from '../services/api';
import { AuthResponse } from '../types/authTypes';
import { useNavigate } from 'react-router-dom';


export const useAuth = () => {
  const navigate = useNavigate(); // Local navigate instance

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

  const logout = useCallback(async () => {
    localStorage.removeItem('accessToken');
    await post('/logout'); // Clear refreshToken cookie on backend
    if (navigate) navigate('/login');
  }, []);

  return { login, register, verifyAccount, resendVerification, logout };
};