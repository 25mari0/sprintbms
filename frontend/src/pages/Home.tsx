import { Button, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      <img src="/banner.png" alt="Sprint Banner" style={{ maxWidth: '100%' }} />
      <Typography variant="h4" sx={{ mt: 2 }}>
        Welcome to Sprint
      </Typography>
      <Typography variant="body1" sx={{ mt: 1 }}>
        Your solution for [brief description].
      </Typography>
      <Box sx={{ mt: 3 }}>
        <Button variant="contained" onClick={() => navigate('/login')} sx={{ mr: 2 }}>
          Login
        </Button>
        <Button variant="outlined" onClick={() => navigate('/register')}>
          Register
        </Button>
      </Box>
    </Box>
  );
}