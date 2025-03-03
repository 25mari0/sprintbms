import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface FormContainerProps {
  title: string;
  children: React.ReactNode;
}

export const FormContainer: React.FC<FormContainerProps> = ({ title, children }) => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
    <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400, borderRadius: 2 }}>
      <Typography variant="h5" component="h1" gutterBottom align="center">
        {title}
      </Typography>
      {children}
    </Paper>
  </Box>
);