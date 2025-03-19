import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, UserData } from '../stores/authStore';
import { get } from '../services/api';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setIsAuthenticated, setIsLoading } = useAuthStore();

  useEffect(() => {

    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const response = await get<{ responseData: UserData }>('/client/me');
        if (response.status === 'success') {
          setUser(response.data!.responseData);
          setIsAuthenticated(true);
          const { hasBusiness, isPremium } = response.data!.responseData;

          if (!hasBusiness) {
            navigate('/business/create?mode=create', { replace: true });
          } else if (!isPremium) {
            navigate('/business/create?mode=renew', { replace: true });
          } else if (['/login', '/register'].includes(location.pathname)) {
            navigate('/dashboard', { replace: true });
          }
        }
      } catch (error) {
        setIsAuthenticated(false);
        if (!['/login', '/register'].includes(location.pathname)) {
          navigate('/login', { replace: true });
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, location.pathname, setUser, setIsAuthenticated, setIsLoading]);

  return <>{children}</>;
};