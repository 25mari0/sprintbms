import { useState, useEffect } from 'react';
import { Modal, Fade, Box, Typography, Button } from '@mui/material';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { FormField } from './FormField';

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 360,
  bgcolor: 'rgba(30, 30, 30, 0.95)',
  backdropFilter: 'blur(8px)',
  color: '#E8ECEF',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  p: 3,
  borderRadius: '12px',
  border: '1px solid #2A2A2A',
};

// Default styles for form fields, matching CustomerFormModal
const defaultFormFieldStyles = {
  InputLabelProps: { style: { color: '#78909C', fontSize: '0.875rem' } },
  sx: {
    input: { color: '#E8ECEF', fontSize: '0.875rem', padding: '8px 12px' },
    '& .MuiInputBase-input': { color: '#E8ECEF', fontSize: '0.875rem', py: 1 },
    '& .MuiInputLabel-root': { top: '-2px' },
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: '#2A2A2A', borderWidth: '1px' },
      '&:hover fieldset': { borderColor: '#4A90E2' },
      '&.Mui-focused fieldset': { borderColor: '#4A90E2', boxShadow: '0 0 8px rgba(74, 144, 226, 0.3)' },
    },
    mb: 2,
  },
};

type FormFieldConfig<T> = {
  label: string;
  name: keyof T;
  validation?: any; // Validation rules for react-hook-form
  type?: string; // e.g., 'text', 'number', 'date'
  disabled?: boolean;
  formFieldStyles?: typeof defaultFormFieldStyles; // Allow overriding styles
};

type FormModalProps<T extends FieldValues> = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: T) => Promise<void>;
  form: UseFormReturn<T>;
  title: string;
  fields: FormFieldConfig<T>[];
  modalError: string | null;
  isSubmitting: boolean;
  submitLabel?: string;
  cancelLabel?: string;
};

export const FormModal = <T extends Record<string, any>>({
  open,
  onClose,
  onSubmit,
  form,
  title,
  fields,
  modalError,
  isSubmitting,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
}: FormModalProps<T>) => {
  const { register, formState: { errors }, handleSubmit } = form;
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    setVisible(open);
  }, [open]);

  const handleLocalClose = () => setVisible(false);

  return (
    <Modal open={open} onClose={handleLocalClose} closeAfterTransition>
      <Fade in={visible} onExited={onClose} timeout={300}>
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ color: '#E8ECEF', fontSize: '1.25rem', fontWeight: 500, mb: 2 }}>
            {title}
          </Typography>
          {modalError && (
            <Typography sx={{ color: '#D81B60', fontSize: '0.875rem', mb: 2, textAlign: 'center' }}>
              {modalError}
            </Typography>
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            {fields.map((field) => (
              <FormField
                key={String(field.name)}
                label={field.label}
                register={register(field.name as Path<T>, field.validation)}
                error={(errors as any)[field.name]} // Type-safe access to errors
                type={field.type || 'text'}
                disabled={field.disabled || isSubmitting}
                {...(field.formFieldStyles || defaultFormFieldStyles)}
              />
            ))}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleLocalClose}
                sx={{
                  color: '#78909C',
                  borderColor: '#2A2A2A',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  px: 2,
                  py: 0.5,
                  mr: 1,
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: '#4A90E2', bgcolor: 'rgba(74, 144, 226, 0.1)' },
                }}
                disabled={isSubmitting}
              >
                {cancelLabel}
              </Button>
              <Button
                variant="contained"
                type="submit"
                sx={{
                  bgcolor: 'linear-gradient(45deg, #4A90E2, #42A5F5)',
                  color: '#E8ECEF',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  px: 2,
                  py: 0.5,
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'scale(1.02)', bgcolor: 'linear-gradient(45deg, #357ABD, #2196F3)' },
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : submitLabel}
              </Button>
            </Box>
          </form>
        </Box>
      </Fade>
    </Modal>
  );
};