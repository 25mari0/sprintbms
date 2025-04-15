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
      const { status, message, redirect } = response.data;

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
        const toastType = options?.toastType || 'error';
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
        method: 'POST',
        ...config,
      });
      const { status, message, redirect } = response.data;

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
        const toastType = options?.toastType || 'error';
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

  put: async <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
    options?: ApiOptions
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await api.request<ApiResponse<T>>({
        url,
        data,
        method: 'PUT',
        ...config,
      });
      const { status, message, redirect } = response.data;

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
        const toastType = options?.toastType || 'error';
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

  del: async <T>(
    url: string,
    config?: AxiosRequestConfig,
    options?: ApiOptions
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await api.request({
        url,
        method: 'DELETE',
        ...config,
      });

      // Handle 204 No Content response
      if (response.status === 204) {
        const successResponse: ApiResponse<T> = {
          status: 'success',
        };

        // Handle toast
        if (!options?.disableToast && url !== '/client/me') {
          const toastMsg = options?.toastMessage || 'Deleted successfully';
          const toastType = options?.toastType || 'success';
          toast[toastType](toastMsg);
        }

        return successResponse;
      }

      // Handle other status codes (e.g., 200 with a body, though unlikely for DELETE)
      const responseData = response.data as ApiResponse<T>;
      const { status, message, redirect } = responseData;

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

      return responseData;
    } catch (error: any) {
      const apiResponse = error.response?.data as ApiResponse<T>;
      const redirect = apiResponse?.redirect;

      // Handle toast for errors
      if (url !== '/client/me' && !options?.disableToast) {
        const toastMsg = options?.toastMessage || apiResponse?.message || 'An unexpected error occurred';
        const toastType = options?.toastType || 'error';
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

export const put = <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
  options?: ApiOptions
) => apiClient.put<T>(url, data, config, options);

export const del = <T>(
  url: string,
  config?: AxiosRequestConfig,
  options?: ApiOptions
) => apiClient.del<T>(url, config, options);