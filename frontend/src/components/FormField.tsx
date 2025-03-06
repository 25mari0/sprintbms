import { FieldError, UseFormRegisterReturn } from 'react-hook-form';
import { TextField } from '@mui/material';

interface FormFieldProps {
  register: UseFormRegisterReturn;
  error?: FieldError;
  label: string;
  type?: string;
}

export const FormField = ({
  register,
  error,
  label,
  type = 'text',
}: FormFieldProps) => (
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
