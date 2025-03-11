import axios, { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import { NavigateFunction } from 'react-router-dom';
import { ApiResponse } from '../types';

const api = axios.create({
 baseURL: import.meta.env.VITE_MAIN_API_URL,
 withCredentials: true,
});

let navigate: NavigateFunction | null = null;
export const setNavigate = (nav: NavigateFunction) => {
 navigate = nav;
};

api.interceptors.request.use((config) => {
 const token = localStorage.getItem('accessToken');
 if (token && !config.headers.Authorization) {
 config.headers.Authorization = `Bearer ${token}`;
 }
 return config;
});

api.interceptors.response.use(
 (response: AxiosResponse<ApiResponse<any>>) => {
 const { data } = response;
 const newAccessToken =
 response.headers.authorization?.split('Bearer ')[1] ||
 (data.status === 'success' && data.data?.accessToken);
 if (newAccessToken && !localStorage.getItem('accessToken')) {
 console.log('Storing accessToken:', newAccessToken);
 localStorage.setItem('accessToken', newAccessToken);
 }
 if (data.status === 'success') {
 if (data.message) toast.success(data.message);
 if (data.data?.redirect && navigate) navigate(data.data.redirect);
 }
 return response;
 },
 (error: AxiosError<ApiResponse<any>>) => {
 const message = error.response?.data?.message || 'Something went wrong';
 const status = error.response?.status ?? 0;
 if (status >= 400 && status < 600) {
 toast.error(message);
 } else if (status === 0) {
 toast.error('Network error—please check your connection');
 }
 return Promise.reject({ status, message });
 }
);

export const get = <T>(url: string) => api.get<ApiResponse<T>>(url).then((res) => res.data);
export const post = <T>(url: string, body?: any) => api.post<ApiResponse<T>>(url, body);

export default api;