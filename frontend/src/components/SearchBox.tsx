import { TextField, TextFieldProps } from '@mui/material';

type SearchBoxProps = Omit<TextFieldProps, 'variant' | 'size'> & {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  label?: string;
};

export const SearchBox = ({
  value,
  onChange,
  onKeyDown,
  label = 'Search',
  ...props
}: SearchBoxProps) => {
  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      variant="outlined"
      size="small"
      sx={{
        maxWidth: '300px',
        '& .MuiInputBase-input': { color: '#E8ECEF', fontSize: '0.875rem', py: 1 },
        '& .MuiInputLabel-root': { color: '#78909C', fontSize: '0.875rem', top: '-2px' },
        '& .MuiOutlinedInput-root': {
          '& fieldset': { borderColor: '#2A2A2A', borderWidth: '1px' },
          '&:hover fieldset': { borderColor: '#4A90E2' },
          '&.Mui-focused fieldset': { borderColor: '#4A90E2', boxShadow: '0 0 8px rgba(74, 144, 226, 0.3)' },
        },
      }}
      {...props}
    />
  );
};