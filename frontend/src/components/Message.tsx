import React from 'react';
import { Typography } from '@mui/material';

interface MessageProps {
  type: 'success' | 'error';
  text: string;
}

export const Message: React.FC<MessageProps> = ({ type, text }) => (
  <Typography
    color={type === 'success' ? 'success.main' : 'error.main'}
    sx={{ mb: 2 }}
  >
    {text}
  </Typography>
);
