import { TextField, TextFieldProps } from '@mui/material';
import { FieldError } from 'react-hook-form';

type TextBoxProps = Omit<TextFieldProps, 'variant' | 'size' | 'error' | 'helperText'> & {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  label?: string;
  register?: any;
  error?: FieldError; // Accept FieldError | undefined
  maxWidth?: string | number;
  slotProps?: TextFieldProps['slotProps'];
};

export const TextBox = ({
  value,
  onChange,
  onKeyDown,
  label = 'Search',
  register,
  error,
  maxWidth,
  slotProps,
  ...props
}: TextBoxProps) => {
  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      variant="outlined"
      size="small"
      error={!!error} 
      helperText={error?.message} 
      sx={{
        maxWidth: maxWidth || '300px',
        '& .MuiInputBase-input': { color: '#E8ECEF', fontSize: '0.875rem', py: 1 },
        '& .MuiInputLabel-root': { color: '#78909C', fontSize: '0.875rem', top: '-6px' },
        '& .MuiOutlinedInput-root': {
          '& fieldset': { borderColor: '#2A2A2A', borderWidth: '1px' },
          '&:hover fieldset': { borderColor: '#4A90E2' },
          '&.Mui-focused fieldset': {
            borderColor: '#4A90E2',
            boxShadow: '0 0 8px rgba(74, 144, 226, 0.3)',
          },
          height: '40px',
        },
        '& .MuiFormHelperText-root': { color: '#D81B60', fontSize: '0.75rem' },
      }}
      slotProps={{
        inputLabel: { style: { color: '#78909C', fontSize: '0.875rem' } },
        ...slotProps,
      }}
      {...(register && register)}
      {...props}
    />
  );
};