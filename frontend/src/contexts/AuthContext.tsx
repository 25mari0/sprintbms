import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, UserData } from '../stores/authStore';
import { get } from '../services/api';
import { includesRoute } from '../utils/typeUtils';

interface AuthProviderProps {
  children: React.ReactNode;
}

const PROTECTED_REDIRECT_ROUTES = ['/login', '/register'] as const;

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { setUser, setIsAuthenticated, setIsLoading } = useAuthStore();

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await get<{ responseData: UserData }>('/client/me');
      if (response.status !== 'success') throw new Error('Auth failed');

      const userData = response.data!.responseData;
      setUser(userData);
      setIsAuthenticated(true);

      const { hasBusiness, isPremium } = userData;
      if (!hasBusiness) {
        navigate('/business/create?mode=create', { replace: true });
      } else if (!isPremium) {
        navigate('/business/create?mode=renew', { replace: true });
      } else if (includesRoute(PROTECTED_REDIRECT_ROUTES, pathname)) {
        navigate('/dashboard', { replace: true });
      }
    } catch {
      setIsAuthenticated(false);
      if (!includesRoute(PROTECTED_REDIRECT_ROUTES, pathname)) {
        navigate('/login', { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate, pathname, setUser, setIsAuthenticated, setIsLoading]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
};