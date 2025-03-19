import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';

export interface ApiResponse<T> {
    status: 'success' | 'error';
    message?: string;
    data?: T & { redirect?: string };
  }

let navigate: (path: string) => void;

export const setNavigate = (navFn: (path: string) => void) => {
  navigate = navFn;
};

const api = axios.create({
    baseURL: import.meta.env.VITE_MAIN_API_URL,
    withCredentials: true,
});

export const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<ApiResponse<T>> = await api.get(url, config);
    if (response.data?.data?.redirect) navigate(response.data?.data?.redirect);
    return response.data;
  } catch (error: any) {
    if (url !== '/client/me') {
      toast.error(error.response?.data?.message);
    }
    throw error;
  }
};

export const post = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<ApiResponse<T>> = await api.post(url, data, config);
    console.log(response.data?.data?.redirect);
    if (response.data?.data?.redirect) navigate(response.data?.data?.redirect);
    return response.data;
  } catch (error: any) {
    if (url !== '/client/me') {
      toast.error(error.response?.data?.message);
    }
    throw error;
  }
};
