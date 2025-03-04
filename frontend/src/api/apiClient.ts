import { ApiError } from '../types/authTypes';

export const apiFetch = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const accessToken = localStorage.getItem('accessToken') || '';
  const defaultOptions: RequestInit = {
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    credentials: 'include', // Send/receive cookies
  };
  const response = await fetch(url, { ...defaultOptions, ...options });

  // Update accessToken from refreshed header
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

export const apiPost = <T>(url: string, data: any): Promise<T> =>
  apiFetch<T>(url, { method: 'POST', body: JSON.stringify(data) });

export const apiGet = <T>(url: string): Promise<T> =>
  apiFetch<T>(url, { method: 'GET' });