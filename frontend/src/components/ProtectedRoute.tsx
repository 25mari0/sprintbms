import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore'; // Your auth store
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      // Rule 1: Not authenticated? Go to login.
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
      }
      // Rule 2: Authenticated, no business? Go to create, unless already there.
      else if (!user?.hasBusiness && pathname !== '/business/create') {
        navigate('/business/create?mode=create', { replace: true });
      }
      // Rule 3: Has business, license expired? Go to renew, unless already there.
      else if (user?.hasBusiness && !user?.isPremium && pathname !== '/business/renew') {
        navigate('/business/renew', { replace: true });
      }
      // Extra: Has business, tries to access create? Go to dashboard.
      else if (user?.hasBusiness && pathname === '/business/create') {
        navigate('/dashboard', { replace: true });
      }
      // Extra: Has business, license valid, tries to access renew? Go to dashboard.
      else if (user?.hasBusiness && user?.isPremium && pathname === '/business/renew') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, user, navigate, pathname]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Don’t render anything if we’re redirecting
  if (!isAuthenticated ||
      (!user?.hasBusiness && pathname !== '/business/create') ||
      (user?.hasBusiness && !user?.isPremium && pathname !== '/business/renew') ||
      (user?.hasBusiness && pathname === '/business/create') ||
      (user?.hasBusiness && user?.isPremium && pathname === '/business/renew')) {
    return null;
  }

  return <>{children}</>;
};