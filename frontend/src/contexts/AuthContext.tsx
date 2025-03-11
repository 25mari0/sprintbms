import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { get } from '../services/api';
import { toast } from 'react-toastify';

interface UserData {
  userId: string;
  email: string;
  role: string;
  hasBusiness: boolean;
  isPremium: boolean;
  licenseExpirationDate: string | null;
}

interface AuthContextType {
  userData: UserData | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const publicRoutes = ['/login', '/register', '/'];
      const isPublicRoute = publicRoutes.includes(location.pathname);

      if (isPublicRoute) {
        if (token) {
          navigate('/dashboard', { replace: true });
        }
        setLoading(false);
        return;
      }

      if (!token) {
        navigate('/login', { replace: true });
        setLoading(false);
        return;
      }

      try {
        const response = await get<UserData>('/client/me');
        if (response.status !== 'success' || !response.data) {
          throw new Error('Authentication failed');
        }
        setUserData(response.data);

        // Redirect based on hasBusiness and isPremium
        const protectedRoutes = ['/dashboard', '/success', '/business/create'];
        const isProtectedRoute = protectedRoutes.some(route => location.pathname.startsWith(route));
        if (isProtectedRoute) {
          if (!response.data.hasBusiness) {
            navigate('/business/create?mode=create', { replace: true });
          } else if (!response.data.isPremium) {
            navigate('/business/create?mode=renew', { replace: true });
          }
        }
      } catch (error) {
        localStorage.removeItem('accessToken');
        toast.error('Session invalid. Please log in again.');
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [location.pathname, navigate]);

  return (
    <AuthContext.Provider value={{ userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}