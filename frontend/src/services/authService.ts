import { apiPost, apiGet } from '../utils/api';
import { RegisterResponse, LoginResponse, TokenValidationResponse, VerifyAccountResponse } from '../types/authTypes';

const BASE_URL = import.meta.env.VITE_MAIN_API_URL;

export const register = async (name: string, email: string, password: string) =>
  apiPost<RegisterResponse>
(`${BASE_URL}/register`, 
  { name, email, password });

export const login = async (email: string, password: string) => {
  const data = await apiPost<LoginResponse>
  (`${BASE_URL}/login`, 
    { email, password });
  localStorage.setItem('accessToken', data.accessToken);
  return data;
};

export const validateToken = async (token: string) =>
  apiGet<TokenValidationResponse>
(`${BASE_URL}/account-verification/token?token=${token}`);

export const confirmAccount = async (token: string) =>
  apiPost<VerifyAccountResponse>
(`${BASE_URL}/account-verification/confirm`, 
  { token });

export const resendVerification = async (token: string) =>
  apiPost<VerifyAccountResponse>
(`${BASE_URL}/account-verification/resend`, 
  { token });