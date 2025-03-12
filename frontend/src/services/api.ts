import axios, { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import { NavigateFunction } from 'react-router-dom';
import { ApiResponse } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_MAIN_API_URL,
  withCredentials: true, // Sends cookies automatically
});

let navigate: NavigateFunction | null = null;
export const setNavigate = (nav: NavigateFunction) => {
  navigate = nav;
};

api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    const { data } = response;
    if (data.status === 'success') {
      if (data.message) toast.success(data.message);
      if (data.data?.redirect && navigate) navigate(data.data.redirect);
    }
    return response;
  },
  (error: AxiosError<ApiResponse<any>>) => {
    const message = error.response?.data?.message || 'Something went wrong';
    const status = error.response?.status ?? 0;

    if (status === 401) {
      if (navigate) navigate('/login', { state: { toast: 'Session expired. Please log in again.' } });
    } else if (status >= 400 && status < 600) {
      toast.error(message);
    } else if (status === 0) {
      toast.error('Network error—check your connection');
    }

    return Promise.reject({ status, message });
  }
);

export const get = <T>(url: string) => api.get<ApiResponse<T>>(url).then((res) => res.data);
export const post = <T>(url: string, body?: any) => api.post<ApiResponse<T>>(url, body);

export default api;