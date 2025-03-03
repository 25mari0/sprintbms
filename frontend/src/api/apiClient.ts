import { ApiError } from '../types/authTypes';

export const apiFetch = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const defaultOptions: RequestInit = {
    headers: { 'Content-Type': 'application/json' },
  };
  const response = await fetch(url, { ...defaultOptions, ...options });
  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.message);
  }
  return response.json();
};

// POST helper
export const apiPost = <T>(url: string, data: any): Promise<T> =>
  apiFetch<T>(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });

// GET helper (for token validation)
export const apiGet = <T>(url: string): Promise<T> =>
  apiFetch<T>(url, {
     method: 'GET' 
  });