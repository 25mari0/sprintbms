import { FormControl, InputLabel, Select, MenuItem, SelectProps } from '@mui/material';

interface DropdownSelectProps extends Omit<SelectProps, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

const DropdownSelect = ({ value, onChange, ...props }: DropdownSelectProps) => (
  <FormControl sx={{ minWidth: 120 }}>
    <InputLabel sx={{ color: '#78909C', fontSize: '0.875rem', top: '-6px' }}>
      Status
    </InputLabel>
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value as string)}
      label="Status"
      sx={{
        color: '#E8ECEF',
        fontSize: '0.875rem',
        height: '40px',
        '& .MuiSelect-select': { py: '8px' },
        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2A2A2A', borderWidth: '1px' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: '#4A90E2',
          boxShadow: '0 0 8px rgba(74, 144, 226, 0.3)',
        },
      }}
      {...props}
    >
      <MenuItem value="">All</MenuItem>
      <MenuItem value="Pending">Pending</MenuItem>
      <MenuItem value="Completed">Completed</MenuItem>
      <MenuItem value="Cancelled">Cancelled</MenuItem>
    </Select>
  </FormControl>
);

export default DropdownSelect;