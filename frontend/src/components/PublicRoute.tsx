import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) return <div>Loading...</div>;
  return !isAuthenticated ? <>{children}</> : null;
};