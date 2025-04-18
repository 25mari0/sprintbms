import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom'; // Add this
import { useAuthStore, UserData } from '../stores/authStore';
import { get } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { setUser, setIsAuthenticated, setIsLoading } = useAuthStore();
  const location = useLocation(); // Get current route


  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await get<UserData>('/client/me');
      if (response.status === 'success' && response.data) {
        setUser(response.data!);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setIsAuthenticated, setIsLoading]);

  // Prevents double mounts which cause 2 toasts
  useEffect(() => {
    // Skip checkAuth on /verify-account
    if (location.pathname !== '/verify-account' && location.pathname !== '/set-password') {
      checkAuth();
    } else {
    }
    return () => {
    };
  }, [checkAuth, location.pathname]); // Depend on pathname

  const { isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
};