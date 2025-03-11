import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { get, post } from '../services/api';
import { UserData, AuthContextType } from '../types';
import { useNavigation } from '../hooks/useNavigation';
import { PUBLIC_ROUTES, PROTECTED_ROUTES, SESSION_EXPIRED_MESSAGE } from '../constants/routes';
import { handleApiError } from '../utils/errorHandler';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { navigate, navigateWithToast } = useNavigation();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname as typeof PUBLIC_ROUTES[number]);

      if (isPublicRoute) {
        if (token) {
          navigate('/dashboard', { replace: true });
        }
        setLoading(false);
        return;
      }

      if (!token) {
        navigateWithToast('/login', SESSION_EXPIRED_MESSAGE, { replace: true });
        setLoading(false);
        return;
      }

      try {
        const response = await get<UserData>('/client/me');
        if (response.status !== 'success' || !response.data) {
          throw new Error('Authentication failed');
        }
        setUserData(response.data);

        const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
          location.pathname.startsWith(route)
        );
        if (isProtectedRoute) {
          if (!response.data.hasBusiness) {
            navigate('/business/create?mode=create', { replace: true });
          } else if (!response.data.isPremium) {
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
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [location.pathname, navigate, navigateWithToast]);

  return (
    <AuthContext.Provider value={{ userData, loading }}>{children}</AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}