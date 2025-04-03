import axios, { AxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T & { redirect?: string };
}

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
  ): Promise<T> => { // Change return type to T
    try {
      const response = await api.get<T>(url, config); // Change to T
      const data = response.data as T & { redirect?: string }; // Cast to T with optional redirect
      const redirect = (data as any).redirect;

      // Handle toast
      if (!options?.disableToast && url !== '/client/me') {
        const toastMsg = options?.toastMessage || (data as any).message;
        if (toastMsg) {
          const toastType = options?.toastType || ((data as any).status === 'success' ? 'success' : 'error');
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

      return response.data; // Return T directly
    } catch (error: any) {
      const apiResponse = error.response?.data as ApiResponse<T>;
      const redirect = apiResponse?.data?.redirect;

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
      const response = await api.post<ApiResponse<T>>(url, data, config);
      const { status, message, data: responseData } = response.data;
      const redirect = responseData?.redirect;

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
      const redirect = apiResponse?.data?.redirect;

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