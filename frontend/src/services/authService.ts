import { apiPost, apiGet } from '../utils/api';
import { RegisterResponse, LoginResponse, TokenValidationResponse, VerifyAccountResponse } from '../types/authTypes';

export const register = async (name: string, email: string, password: string) =>
  apiPost<RegisterResponse>
(`${process.env.MAIN_BACKEND}/register`, 
  { name, email, password });

export const login = async (email: string, password: string) => {
  const data = await apiPost<LoginResponse>
  (`${process.env.MAIN_BACKEND}/login`, 
    { email, password });
  localStorage.setItem('accessToken', data.accessToken);
  return data;
};

export const validateToken = async (token: string) =>
  apiGet<TokenValidationResponse>
(`${process.env.MAIN_BACKEND}/account-verification/token?token=${token}`);

export const confirmAccount = async (token: string) =>
  apiPost<VerifyAccountResponse>
(`${process.env.MAIN_BACKEND}/account-verification/confirm`, 
  { token });

export const resendVerification = async (token: string) =>
  apiPost<VerifyAccountResponse>
(`${process.env.MAIN_BACKEND}/account-verification/resend`, 
  { token });