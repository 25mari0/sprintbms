import { TextBox } from './TextBox';

type FormFieldProps = {
  label: string;
  register: any;
  error?: any;
  type?: string;
  disabled?: boolean;
  slotProps?: {
    inputLabel?: { style: { color: string; fontSize: string } }; // Define specific slotProps needed
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
      slotProps={slotProps} // Pass slotProps instead of InputLabelProps
      sx={sx}
      maxWidth={maxWidth || '100%'}
    />
  );
};