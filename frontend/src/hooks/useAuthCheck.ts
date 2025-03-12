import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { get } from '../services/api';
import { UserData } from '../types';
import { useNavigation } from './useNavigation';
import { PUBLIC_ROUTES, PROTECTED_ROUTES, SESSION_EXPIRED_MESSAGE } from '../constants/routes';
import { includesRoute } from '../utils/typeUtils';

export const useAuthCheck = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const { navigate, navigateWithToast } = useNavigation();
  const { pathname } = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await get<UserData>('/client/me');
        if (response.status === 'success' && response.data) {
          setUserData(response.data);
          // If on a public route and authenticated, go to dashboard
          if (includesRoute(PUBLIC_ROUTES, pathname)) {
            navigate('/dashboard', { replace: true });
          } else {
            // Handle protected routes
            const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
            if (isProtectedRoute) {
              if (!response.data.hasBusiness) {
                navigate('/business/create?mode=create', { replace: true });
              } else if (!response.data.isPremium) {
                navigate('/business/create?mode=renew', { replace: true });
              }
            }
          }
        } else {
          // Not authenticated, redirect to login if not on a public route
          if (!includesRoute(PUBLIC_ROUTES, pathname)) {
            navigateWithToast('/login', SESSION_EXPIRED_MESSAGE, { replace: true });
          }
        }
      } catch {
        // Error fetching /client/me, redirect to login if not on a public route
        if (!includesRoute(PUBLIC_ROUTES, pathname)) {
          navigateWithToast('/login', SESSION_EXPIRED_MESSAGE, { replace: true });
        }
      }
    };

    checkAuth();
  }, [pathname, navigate, navigateWithToast]);

  return { userData };
};