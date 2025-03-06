import { useEffect, useState } from 'react';
import { useProtectedApi } from '../hooks/useProtectedApi';
import { useAuth } from '../contexts/AuthContext';
import { AppError } from '../api/apiClient';
import { Button, Box, Typography } from '@mui/material';

const Dashboard = () => {
  const [message, setMessage] = useState<string>('');
  const { protectedGet } = useProtectedApi();
  const { logout, token } = useAuth();

  useEffect(() => {
    console.log('Dashboard useEffect, token:', token);
    const fetchData = async () => {
      try {
        const data = await protectedGet<{ message: string }>(
          '/client/protected',
        );
        setMessage(data.message);
      } catch (err) {
        if (err instanceof AppError) {
          if (err.message.includes('business')) {
            setMessage('Please create a business to access the dashboard.');
          } else {
            setMessage(`Error: ${err.message}`);
          }
        } else {
          setMessage('Failed to load dashboard data');
        }
      }
    };

    if (token) {
      fetchData();
    }
  }, [protectedGet, token]);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography>{message || 'Loading...'}</Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={logout}
        sx={{ mt: 2 }}
      >
        Logout
      </Button>
    </Box>
  );
};

export default Dashboard;
