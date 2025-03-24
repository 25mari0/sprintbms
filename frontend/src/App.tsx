import { Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, createTheme } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import { setNavigate } from './services/api';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import ProtectedLayout from './components/ProtectedLayout';
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
import Home from './pages/Home';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#5d87ff' },
    secondary: { main: '#49beff' },
    background: { default: '#30475E', paper: '#1d1d1d' },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
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
      <Box sx={{ minHeight: '100vh', marginLeft: '0px' }}>
        <Suspense fallback={<LoadingSpinner />}>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/verify-account" element={<VerifyAccount />} />
              <Route path="/success" element={<ProtectedRoute><Success /></ProtectedRoute>} />
              
              <Route path="/dashboard" element={<ProtectedRoute><ProtectedLayout children={undefined} /><Dashboard /></ProtectedRoute>} />
              <Route path="/business/create" element={<ProtectedRoute><ProtectedLayout children={undefined} /><BusinessCreate /></ProtectedRoute>} />
              <Route path="/business/renew" element={<ProtectedRoute><ProtectedLayout children={undefined} /><BusinessRenew /></ProtectedRoute>} />
              
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