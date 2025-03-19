import axios, { AxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T & { redirect?: string };
}

const api = axios.create({
  baseURL: import.meta.env.VITE_MAIN_API_URL,
  withCredentials: true,
});

type NavigateFn = (path: string) => void;

const createApiClient = (navigate?: NavigateFn) => ({
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response = await api.get<ApiResponse<T>>(url, config);
      if (navigate && response.data?.data?.redirect) {
        navigate(response.data.data.redirect);
      }
      return response.data;
    } catch (error: any) {
      if (url !== '/client/me') {
        toast.error(error.response?.data?.message || 'An unexpected error occurred');
      }
      throw error;
    }
  },

  post: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response = await api.post<ApiResponse<T>>(url, data, config);
      if (navigate && response.data?.data?.redirect) {
        navigate(response.data.data.redirect);
      }
      return response.data;
    } catch (error: any) {
      if (url !== '/client/me') {
        toast.error(error.response?.data?.message || 'An unexpected error occurred');
      }
      throw error;
    }
  },
});

// Singleton instance with setter
let apiClient = createApiClient();
export const setNavigate = (navFn: NavigateFn) => {
  apiClient = createApiClient(navFn);
};

export const { get, post } = apiClient;