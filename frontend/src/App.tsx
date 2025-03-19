import { Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, createTheme } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import { setNavigate } from './services/api';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyAccount from './pages/VerifyAccount';
import Success from './pages/Success';
import BusinessCreate from './pages/BusinessCreate';
import Dashboard from './pages/Dashboard';
import BusinessRenew from './pages/BusinessRenew';
import 'react-toastify/dist/ReactToastify.css';
import { Suspense } from 'react';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useEffect } from 'react';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    background: { default: '#121212', paper: '#1d1d1d' },
  },
});

const App = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh' }}>
        <Suspense fallback={<LoadingSpinner />}>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/verify-account" element={<VerifyAccount />} />
              <Route path="/success" element={<ProtectedRoute><Success /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/business/create" element={<ProtectedRoute><BusinessCreate /></ProtectedRoute>} />
              <Route path="/business/renew" element={<ProtectedRoute><BusinessRenew /></ProtectedRoute>} />
            </Routes>
          </AuthProvider>
        </Suspense>
      </Box>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar
        closeOnClick
        pauseOnHover
        theme="dark"
      />
    </ThemeProvider>
  );
};

export default App;