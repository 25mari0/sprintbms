// src/services/api.ts
import axios, { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import { NavigateFunction } from 'react-router-dom';
import { ApiResponse } from '../types/api';

let navigate: NavigateFunction | null = null;

export const setNavigate = (nav: NavigateFunction) => {
  navigate = nav;
};

const DEFAULT_BASE_URL = import.meta.env.VITE_MAIN_API_URL;

const api = axios.create({
  baseURL: DEFAULT_BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const data = response.data;
    if (data.status === 'success') {
      if (data.message) toast.success(data.message);
      if (data.data?.redirect && navigate) navigate(data.data.redirect);
    }
    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    const message = error.response?.data?.message || 'Something went wrong';
    const status = error.response?.status ?? 0;
    if (status >= 400 && status < 600) {
      toast.error(message); // Toast all HTTP errors
    } else if (status === 0) {
      toast.error('Network error—please check your connection');
    }
    return Promise.reject({ status, message });
  }
);

export const get = async <T>(url: string): Promise<ApiResponse<T>> => {
  const response = await api.get<ApiResponse<T>>(url);
  return response.data;
};

export const post = async <T>(url: string, body?: any): Promise<ApiResponse<T>> => {
  const response = await api.post<ApiResponse<T>>(url, body);
  return response.data;
};

export default api;