import { apiPost, apiGet } from './apiClient';
import { RegisterResponse, LoginResponse, TokenValidationResponse, VerifyAccountResponse } from '../types/authTypes';

const BASE_URL = import.meta.env.VITE_MAIN_API_URL;

export const register = async (name: string, email: string, password: string) =>
  apiPost<RegisterResponse>
(`/client/register`, 
  { name, email, password }, BASE_URL);

export const login = async (email: string, password: string) => {
  const data = await apiPost<LoginResponse>
  (`/client/login`, 
    { email, password }, BASE_URL);
    // recommended jwt flow here is to respond login with accessToken on the body and manually set it in localStorage
  localStorage.setItem('accessToken', data.accessToken);
  return data;
};

export const validateToken = async (token: string) =>
  apiGet<TokenValidationResponse>
(`/client/account-verification/token?token=${token}`, BASE_URL);

export const confirmAccount = async (token: string) => {
  return apiPost<VerifyAccountResponse>
  (`/client/account-verification/confirm`, 
    { token }, BASE_URL);
};

export const resendVerification = async (token: string) =>
  apiPost<VerifyAccountResponse>
  (`/client/account-verification/resend?token=${token}`, {
    token,
  }, BASE_URL);

export const getDashboardData = async () => {
  return apiGet<{ message: string }>(`/client/protected`, BASE_URL);
};