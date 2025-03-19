import { FieldError, UseFormRegisterReturn } from 'react-hook-form';
import { TextField, TextFieldProps } from '@mui/material';

interface FormFieldProps extends Omit<TextFieldProps, 'error' | 'helperText'> {
  register: UseFormRegisterReturn;
  error?: FieldError;
  label: string;
  type?: string;
  disabled?: boolean;
}

export const FormField = ({
  register,
  error,
  label,
  type = 'text',
  disabled,
  ...textFieldProps
}: FormFieldProps) => (
  <TextField
    {...register}
    label={label}
    type={type}
    error={!!error}
    helperText={error?.message}
    fullWidth
    margin="normal"
    disabled={disabled}
    {...textFieldProps}
  />
);