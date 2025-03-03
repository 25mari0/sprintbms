import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyAccount from './pages/VerifyAccount';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' }, // Light blue for buttons
    background: {
      default: '#121212', // Dark background
      paper: '#1d1d1d',   // Dark Paper for forms
    },
  },
});

const App: React.FC = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline /> {/* Resets body margin and applies theme background */}
    <Box sx={{ minHeight: '100vh' }}> {/* bgcolor removed—CssBaseline handles it */}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-account" element={<VerifyAccount />} />
      </Routes>
    </Box>
  </ThemeProvider>
);

export default App;