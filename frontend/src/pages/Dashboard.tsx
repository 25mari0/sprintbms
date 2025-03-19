import { Box, Typography } from '@mui/material';

export const Dashboard = () => {
  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4">Dashboard</Typography>
      <Typography variant="body1">Welcome to your dashboard!</Typography>
    </Box>
  );
};

export default Dashboard;