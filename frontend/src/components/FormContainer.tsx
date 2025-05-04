import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface FormContainerProps {
  title: string;
  children: ReactNode;
}

export const FormContainer = ({ title, children }: FormContainerProps) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      bgcolor: '#121212', // Dark background
      p: 3,
    }}
  >
    <Box
      sx={{
        width: '100%',
        maxWidth: 400,
        bgcolor: 'rgba(30, 30, 30, 0.95)', // Semi-transparent dark background
        backdropFilter: 'blur(8px)', // Glassmorphism effect
        color: '#E8ECEF', // Light text color
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)', // Shadow for depth
        p: 4,
        borderRadius: '12px', // Rounded corners
        border: '1px solid #2A2A2A', // Subtle border
      }}
    >
      <Typography
        variant="h5"
        component="h1"
        sx={{ mb: 3, fontWeight: 500, textAlign: 'center' }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  </Box>
);