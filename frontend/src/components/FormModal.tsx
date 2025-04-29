import { useState, useEffect } from 'react';
import { Modal, Fade, Box, Typography } from '@mui/material';
import { UseFormReturn, FieldValues, Path } from 'react-hook-form';
import { FormField } from './FormField';
import { CustomButton } from './CustomButton';

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

const defaultFormFieldStyles = {
  slotProps: {
    inputLabel: { style: { color: '#78909C', fontSize: '0.875rem' } },
  },
  sx: {
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

type FormFieldConfig<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  validation?: any;
  type?: string;
  disabled?: boolean;
  formFieldStyles?: {
    slotProps?: {
      inputLabel?: { style: { color: string; fontSize: string } };
    };
    sx?: any;
  };
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

export const FormModal = <T extends FieldValues>({
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
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              {fields.map((field) => (
                <FormField
                  key={String(field.name)}
                  label={field.label}
                  register={register(field.name, field.validation)}
                  error={(errors as any)[field.name]}
                  type={field.type || 'text'}
                  disabled={field.disabled || isSubmitting}
                  {...(field.formFieldStyles || defaultFormFieldStyles)}
                />
              ))}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 1, // Small gap (~8px) between buttons
                  mt: 2,
                  width: '100%', // Ensure the buttons container matches the textboxes' width
                }}
              >
                <CustomButton
                  customVariant="secondary"
                  onClick={handleLocalClose}
                  disabled={isSubmitting}
                >
                  {cancelLabel}
                </CustomButton>
                <CustomButton
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : submitLabel}
                </CustomButton>
              </Box>
            </Box>
          </form>
        </Box>
      </Fade>
    </Modal>
  );
};