import React from 'react';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';
import { TextField } from '@mui/material';

interface FormFieldProps {
  register: UseFormRegisterReturn;
  error?: FieldError;
  label: string;
  type?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ register, error, label, type = 'text' }) => (
  <TextField
    {...register}
    label={label}
    type={type}
    error={!!error}
    helperText={error?.message}
    fullWidth
    margin="normal"
  />
);