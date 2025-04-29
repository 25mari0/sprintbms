import { TextBox } from './TextBox';

type FormFieldProps = {
  label: string;
  register: any;
  error?: any;
  type?: string;
  disabled?: boolean;
  slotProps?: {
    inputLabel?: { style: { color: string; fontSize: string } }; 
  };
  sx?: any;
  maxWidth?: string | number;
};

export const FormField = ({
  label,
  register,
  error,
  type = 'text',
  disabled,
  slotProps,
  sx,
  maxWidth,
}: FormFieldProps) => {
  return (
    <TextBox
      label={label}
      type={type}
      disabled={disabled}
      register={register}
      error={error}
      slotProps={slotProps} 
      sx={sx}
      maxWidth={maxWidth || '100%'}
    />
  );
};