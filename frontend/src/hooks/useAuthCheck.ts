import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { get, post } from '../services/api';
import { UserData } from '../types';
import { useNavigation } from './useNavigation';
import {
  PUBLIC_ROUTES,
  PROTECTED_ROUTES,
  SESSION_EXPIRED_MESSAGE,
} from '../constants/routes';
import { handleApiError } from '../utils/errorHandler';
import { includesRoute } from '../utils/typeUtils';

// Cache for auth promise to avoid refetching on every render
const authPromiseCache: { current?: Promise<UserData | null> } = {};

const fetchAuthData = async (): Promise<UserData | null> => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;

  const response = await get<UserData>('/client/me');
  if (response.status !== 'success' || !response.data) {
    throw new Error('Authentication failed');
  }
  return response.data;
};

export const useAuthCheck = () => {
  const [userData, setUserData] = useState<UserData | null>(() => {
    // Throw cached promise if it exists (Suspense will catch it)
    if (authPromiseCache.current) {
      throw authPromiseCache.current;
    }
    return null;
  });
  const { navigate, navigateWithToast } = useNavigation();
  const { pathname } = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');

      // Public route handling
      if (includesRoute(PUBLIC_ROUTES, pathname)) {
        if (token) {
          navigate('/dashboard', { replace: true });
        }
        return;
      }

      // No token, redirect
      if (!token) {
        navigateWithToast('/login', SESSION_EXPIRED_MESSAGE, { replace: true });
        return;
      }

      try {
        // Start fetching and cache the promise
        const authPromise = fetchAuthData();
        authPromiseCache.current = authPromise;
        const data = await authPromise;
        authPromiseCache.current = undefined; // Clear cache on success

        if (!data) {
          throw new Error('No user data');
        }
        setUserData(data);

        // Protected route redirects
        const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
          pathname.startsWith(route)
        );
        if (isProtectedRoute) {
          if (!data.hasBusiness) {
            navigate('/business/create?mode=create', { replace: true });
          } else if (!data.isPremium) {
            navigate('/business/create?mode=renew', { replace: true });
          }
        }
      } catch (error) {
        try {
          await post('/client/logout');
        } catch (logoutError) {
          handleApiError(logoutError, 'Logout failed during cleanup');
        }
        localStorage.removeItem('accessToken');
        navigateWithToast('/login', SESSION_EXPIRED_MESSAGE, { replace: true });
      }
    };

    checkAuth();
  }, [pathname, navigate, navigateWithToast]);

  // Throw the promise if still fetching
  if (!userData && authPromiseCache.current) {
    throw authPromiseCache.current;
  }

  return { userData };
};