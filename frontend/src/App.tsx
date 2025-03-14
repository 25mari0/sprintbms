import { Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, CircularProgress } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import { setNavigate } from './services/api';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute'; // New import
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyAccount from './pages/VerifyAccount';
import Success from './pages/Success';
import BusinessCreate from './pages/BusinessCreate';
import Dashboard from './pages/Dashboard';
import 'react-toastify/dist/ReactToastify.css';
import { Suspense } from 'react';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    background: { default: '#121212', paper: '#1d1d1d' },
  },
});

const App = () => {
  const navigate = useNavigate();
  setNavigate(navigate);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh' }}>
        <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>}>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-account" element={<VerifyAccount />} />
              <Route
                path="/success"
                element={<ProtectedRoute><Success /></ProtectedRoute>}
              />
              <Route
                path="/dashboard"
                element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
              />
              <Route
                path="/business/create"
                element={<ProtectedRoute><BusinessCreate /></ProtectedRoute>}
              />
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