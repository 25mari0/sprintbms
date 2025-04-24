import { Button, ButtonProps } from '@mui/material';
import { ReactNode } from 'react';

type CustomButtonProps = ButtonProps & {
  customVariant?: 'primary' | 'secondary'; // Primary (gradient) or secondary (outlined)
  startIcon?: ReactNode;
  endIcon?: ReactNode;
};

export const CustomButton = ({
  customVariant = 'primary',
  startIcon,
  endIcon,
  children,
  sx,
  ...props
}: CustomButtonProps) => {
  const baseStyles = {
    borderRadius: '12px',
    fontSize: '0.875rem',
    px: 2,
    py: 0.75,
    width: 'auto',
    transition: 'all 0.2s',
  };

  const primaryStyles = {
    bgcolor: 'linear-gradient(45deg, #4A90E2, #42A5F5)',
    color: '#E8ECEF',
    '&:hover': {
      transform: 'scale(1.02)',
      bgcolor: 'linear-gradient(45deg, #357ABD, #2196F3)',
    },
    '&:disabled': {
      bgcolor: 'rgba(74, 144, 226, 0.3)',
      color: '#78909C',
    },
  };

  const secondaryStyles = {
    color: '#78909C',
    borderColor: '#2A2A2A',
    '&:hover': {
      borderColor: '#4A90E2',
      bgcolor: 'rgba(74, 144, 226, 0.1)',
    },
    '&:disabled': {
      borderColor: '#2A2A2A',
      color: '#4A4A4A',
    },
  };

  return (
    <Button
      variant={customVariant === 'primary' ? 'contained' : 'outlined'}
      startIcon={startIcon}
      endIcon={endIcon}
      sx={{
        ...baseStyles,
        ...(customVariant === 'primary' ? primaryStyles : secondaryStyles),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};