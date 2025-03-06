// components/PrivateRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = () => {
  const { isAuthenticated, token } = useAuth();
  console.log(
    'PrivateRoute check, isAuthenticated:',
    isAuthenticated,
    'token:',
    token,
  ); // Debug
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ error: 'Session terminated.' }} />
  );
};

export default PrivateRoute;
