import { Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, createTheme } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import { setNavigate } from './services/api';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import ProtectedLayout from './components/ProtectedLayout';
import 'react-toastify/dist/ReactToastify.css';
import { Suspense, lazy } from 'react'; 
import { LoadingSpinner } from './components/LoadingSpinner';
import { useEffect } from 'react';
import './App.css';

//page imports use React.lazy
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const VerifyAccount = lazy(() => import('./pages/VerifyAccount'));
const Success = lazy(() => import('./pages/Success'));
const BusinessCreate = lazy(() => import('./pages/BusinessCreate'));
const BusinessRenew = lazy(() => import('./pages/BusinessRenew'));
const Home = lazy(() => import('./pages/Home'));
const BookingsPage = lazy(() => import('./pages/Bookings'));
const WorkerManagement = lazy(() => import('./pages/WorkerManagement'));
const WorkerSetPassword = lazy(() => import('./pages/WorkerSetPassword'));
const CustomerManagement = lazy(() => import('./pages/CustomerManagement'));
const Services = lazy(() => import('./pages/Services'));

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#4A90E2", // Vibrant blue for highlights
      light: "#74B3FF",
      dark: "#1E4B9E",
      contrastText: "#fff",
    },
    secondary: {
      main: "#64B5F6", // Softer blue for accents
      light: "#A6D4FA",
      dark: "#2286C3",
      contrastText: "#000",
    },
    background: {
      default: "#121212", // Dark background
      paper: "#1E1E1E", // Slightly lighter panels
    },
    text: {
      primary: "#E3F2FD", // Light blueish text
      secondary: "#A8C7E2", // Muted blue for secondary text
    },
    error: {
      main: "#FF5252",
    },
    warning: {
      main: "#FFC107",
    },
    success: {
      main: "#4CAF50",
    },
    info: {
      main: "#29B6F6",
    },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    fontSize: 14,
    button: {
      textTransform: "none", // Prevents uppercase transformation
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#1E1E1E",
        },
      },
    },
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
        <AuthProvider>
        <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/verify-account" element={<VerifyAccount />} />
              <Route path="/set-password" element={<PublicRoute><WorkerSetPassword /></PublicRoute>} />
              <Route path="/success" element={<ProtectedRoute><Success /></ProtectedRoute>} />
              <Route path="/services" element={<ProtectedRoute><ProtectedLayout><Services /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/workers" element={<ProtectedRoute><ProtectedLayout><WorkerManagement /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/bookings" element={<ProtectedRoute><ProtectedLayout><BookingsPage /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/customers" element={<ProtectedRoute><ProtectedLayout><CustomerManagement/></ProtectedLayout></ProtectedRoute>} />
              <Route path="/business/create" element={<ProtectedRoute><ProtectedLayout><BusinessCreate /></ProtectedLayout></ProtectedRoute>} />              
              <Route path="/business/renew" element={<ProtectedRoute><ProtectedLayout><BusinessRenew /></ProtectedLayout></ProtectedRoute>} />   
            </Routes>
        </Suspense>
        </AuthProvider>
      </Box>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        closeOnClick
        pauseOnHover
        theme="dark"
        toastStyle={{ backgroundColor: "#1E1E1E"}} // Apply background
      />
    </ThemeProvider>
  );
};

export default App;