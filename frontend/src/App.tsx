import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyAccount from './pages/VerifyAccount';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Ensure styles are imported

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    background: {
      default: '#121212',
      paper: '#1d1d1d',
    },
  },
});

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Box sx={{ minHeight: '100vh' }}>
      <Routes>
        <Route path="/" element={<Login />} /> {/* Default to Login for now */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-account" element={<VerifyAccount />} />
      </Routes>
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

export default App;