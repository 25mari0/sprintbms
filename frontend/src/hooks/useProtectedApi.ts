import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiFetch, apiGet, apiPost, AppError } from '../api/apiClient';
import { useCallback } from 'react';

export const useProtectedApi = () => {
  const { logout, token } = useAuth();
  const navigate = useNavigate();

  const handleAuthError = (err: unknown) => {
    if (err instanceof AppError) {
      if (
        err.status === 401 ||
        (err.status === 400 && err.message.includes('token'))
      ) {
        logout();
        document.cookie =
          'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        navigate('/login', {
          state: { error: 'Session expired. Please log in again.' },
        });
      }
    }
    throw err;
  };

  const protectedGet = useCallback(
    async <T>(url: string, baseUrl?: string) => {
      if (!token) {
        throw new Error('No token available—please log in.');
      }
      console.log('protectedGet called:', url); // Debug
      try {
        return await apiGet<T>(url, baseUrl);
      } catch (err) {
        handleAuthError(err);
        return Promise.reject(err);
      }
    },
    [token, navigate, logout],
  ); // Dependencies for handleAuthError

  const protectedPost = useCallback(
    async <T>(url: string, data: any, baseUrl?: string) => {
      if (!token) {
        throw new Error('No token available—please log in.');
      }
      try {
        return await apiPost<T>(url, data, baseUrl);
      } catch (err) {
        handleAuthError(err);
        return Promise.reject(err);
      }
    },
    [token, navigate, logout],
  );

  return { protectedGet, protectedPost, protectedFetch: apiFetch };
};
