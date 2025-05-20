import React, { useState, useCallback, useMemo } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';

interface SearchDropdownProps<T> {
  value: T | null;
  onChange: (value: T | null) => void;
  fetchOptions: (search: string) => Promise<T[]>;
  getOptionLabel: (option: T) => string;
  renderOption?: (option: T) => React.ReactNode;
  label?: string;
  error?: boolean;
  helperText?: string;
}

export function SearchDropdown<T>({
  value,
  onChange,
  fetchOptions,
  getOptionLabel,
  renderOption,
  label = "Select",
  error,
  helperText,
}: SearchDropdownProps<T>) {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounced fetch
  const fetch = useCallback(
    (search: string) => {
      setLoading(true);
      fetchOptions(search)
        .then(setOptions)
        .finally(() => setLoading(false));
    },
    [fetchOptions]
  );

  // Fetch on input change
  React.useEffect(() => {
    if (inputValue) fetch(inputValue);
    else fetch('');
  }, [inputValue, fetch]);

  const mergedOptions = useMemo(() => {
    if (value && !options.some(opt => getOptionLabel(opt) === getOptionLabel(value))) {
      return [value, ...options];
    }
    return options;
  }, [options, value, getOptionLabel]);   

  return (
    <Autocomplete
      options={mergedOptions}
      getOptionLabel={getOptionLabel}
      value={value}
      onChange={(_, v) => onChange(v)}
      inputValue={inputValue}
      onInputChange={(_, v) => setInputValue(v)}
      loading={loading}
      filterOptions={x => x}
      isOptionEqualToValue={(o: any, v: any) => o?.id === v?.id}
      ListboxProps={{
        style: { 
          maxHeight: '288px', // 6 items * 48px height
          overflowY: 'auto',
        }
      }}
      renderOption={(props, option) => (
        <li {...props}>
          {renderOption ? renderOption(option) : getOptionLabel(option)}
        </li>
      )}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          size="small"
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={16} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      sx={{
        '& .MuiAutocomplete-listbox': {
          '&::-webkit-scrollbar': {
            width: '6px',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '3px',
          },
          backgroundColor: 'rgba(30, 30, 30, 0.95)',
        },
        '& .MuiPaper-root': {
          backgroundColor: 'rgba(30, 30, 30, 0.95)',
          color: '#E8ECEF',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          borderRadius: '8px',
          border: '1px solid #2A2A2A',
        },
      }}
    />
  );
}
