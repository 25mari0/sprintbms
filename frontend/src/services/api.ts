// src/services/api.ts
import axios, { AxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';
import { ApiResponse } from '../types'; // Import the ApiResponse type

// Options for customizing API behavior
interface ApiOptions {
  toastMessage?: string;        // Override the toast message
  disableToast?: boolean;       // Disable the toast entirely
  toastType?: 'success' | 'error' | 'info' | 'warning'; // Optional toast type to override default
  onRedirect?: (redirect: string) => void; // Custom redirect handler
}

const api = axios.create({
  baseURL: import.meta.env.VITE_MAIN_API_URL,
  withCredentials: true,
});

type NavigateFn = (path: string) => void;

const createApiClient = (navigate?: NavigateFn) => ({
  get: async <T>(
    url: string,
    config?: AxiosRequestConfig,
    options?: ApiOptions
  ): Promise<ApiResponse<T>> => { 
    try {
      const response = await api.get<ApiResponse<T>>(url, config); 
      const { status, message, redirect } = response.data; // Destructure with a renamed data variable

      // Handle toast
      if (!options?.disableToast && url !== '/client/me') {
        const toastMsg = options?.toastMessage || message;
        if (toastMsg) {
          const toastType = options?.toastType || (status === 'success' ? 'success' : 'error');
          toast[toastType](toastMsg);
        }
      }

      // Handle redirect
      if (redirect && navigate) {
        if (options?.onRedirect) {
          options.onRedirect(redirect);
        } else {
          navigate(redirect);
        }
      }

      return response.data; 
    } catch (error: any) {
      const apiResponse = error.response?.data as ApiResponse<T>;
      const redirect = apiResponse?.redirect;

      // Handle toast for errors
      if (url !== '/client/me' && !options?.disableToast) {
        const toastMsg = options?.toastMessage || apiResponse?.message || 'An unexpected error occurred';
        const toastType = options?.toastType || 'error'; // Default to 'error' in catch block
        toast[toastType](toastMsg);
      }

      // Handle redirect for errors
      if (redirect && navigate) {
        if (options?.onRedirect) {
          options.onRedirect(redirect);
        } else {
          navigate(redirect);
        }
      }

      throw error;
    }
  },
  post: async <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
    options?: ApiOptions
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await api.request<ApiResponse<T>>({
        url,
        data,
        method: 'POST', // Default to POST if no method is specified
        ...config, // Spread config to allow method override
      });
      const { status, message, redirect} = response.data;

      // Handle toast
      if (!options?.disableToast && url !== '/client/me') {
        const toastMsg = options?.toastMessage || message;
        if (toastMsg) {
          const toastType = options?.toastType || (status === 'success' ? 'success' : 'error');
          toast[toastType](toastMsg);
        }
      }

      // Handle redirect
      if (redirect && navigate) {
        if (options?.onRedirect) {
          options.onRedirect(redirect);
        } else {
          navigate(redirect);
        }
      }

      return response.data;
    } catch (error: any) {
      const apiResponse = error.response?.data as ApiResponse<T>;
      const redirect = apiResponse?.redirect;

      // Handle toast for errors
      if (url !== '/client/me' && !options?.disableToast) {
        const toastMsg = options?.toastMessage || apiResponse?.message || 'An unexpected error occurred';
        const toastType = options?.toastType || 'error'; // Default to 'error' in catch block
        toast[toastType](toastMsg);
      }

      // Handle redirect for errors
      if (redirect && navigate) {
        if (options?.onRedirect) {
          options.onRedirect(redirect);
        } else {
          navigate(redirect);
        }
      }

      throw error;
    }
  },
});

let apiClient = createApiClient();

export const setNavigate = (navFn: NavigateFn) => {
  apiClient = createApiClient(navFn);
};

export const get = <T>(
  url: string,
  config?: AxiosRequestConfig,
  options?: ApiOptions
) => apiClient.get<T>(url, config, options);

export const post = <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
  options?: ApiOptions
) => apiClient.post<T>(url, data, config, options);