import { Box, CircularProgress } from '@mui/material';

export const LoadingSpinner = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh', // Full-screen
    }}
  >
    <CircularProgress />
  </Box>
);