import { ApiError } from "../types/authTypes";

const DEFAULT_BASE_URL = import.meta.env.VITE_MAIN_API_URL;

export const apiFetch = async <T>(
  url: string,
  options: RequestInit = {},
  baseUrl: string = DEFAULT_BASE_URL,
): Promise<T> => {
  const accessToken = localStorage.getItem('accessToken') || '';
  const fullUrl = `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    credentials: 'include',
  };
  const response = await fetch(fullUrl, { ...defaultOptions, ...options });

  const newAccessToken = response.headers.get('Authorization')?.replace('Bearer ', '');
  if (newAccessToken) {
    localStorage.setItem('accessToken', newAccessToken);
  }

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.message);
  }

  return response.json();
};

export const apiPost = <T>(url: string, data: any, baseUrl?: string) =>
  apiFetch<T>(url, { method: 'POST', body: JSON.stringify(data) }, baseUrl);

export const apiGet = <T>(url: string, baseUrl?: string) =>
  apiFetch<T>(url, { method: 'GET' }, baseUrl);