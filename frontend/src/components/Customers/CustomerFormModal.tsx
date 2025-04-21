import { useState, useEffect } from 'react';
import { Modal, Fade, Box, Typography, Button } from '@mui/material';
import { UseFormReturn } from 'react-hook-form';
import { FormField } from '../FormField';
import { customerPhoneValidation, CustomerFormData } from '../../utils/customerValidations';
import { nameValidation as customerNameValidation } from '../../utils/userValidations';


const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#1E1E1E',
  color: '#E3F2FD',
  boxShadow: 24,
  p: 4,
  borderRadius: '8px',
  border: '1px solid #3A3A3A',
};

const formFieldStyles = {
  InputLabelProps: { style: { color: '#A8C7E2' } },
  sx: {
    input: { color: '#E3F2FD' },
    '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#3A3A3A' } },
  },
};

type CustomerFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerFormData) => void;
  modalError: string | null;
  isSubmitting: boolean;
  form: UseFormReturn<CustomerFormData>;
  title: string;
};

export const CustomerFormModal = ({
  open,
  onClose,
  onSubmit,
  modalError,
  isSubmitting,
  form,
  title,
}: CustomerFormModalProps) => {
  const { register, formState: { errors }, handleSubmit } = form;
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    setVisible(open);
  }, [open]);

  const handleLocalClose = () => setVisible(false);

  return (
    <Modal open={open} onClose={handleLocalClose} closeAfterTransition>
      <Fade in={visible} onExited={onClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom sx={{ color: '#E3F2FD' }}>
            {title}
          </Typography>
          {modalError && <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>{modalError}</Typography>}
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormField
              label="Name"
              register={register('name', customerNameValidation)}
              error={errors.name}
              disabled={isSubmitting}
              {...formFieldStyles}
            />
            <FormField
              label="Phone"
              register={register('phone', customerPhoneValidation)}
              error={errors.phone}
              disabled={isSubmitting}
              {...formFieldStyles}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleLocalClose}
                sx={{ mr: 2, color: '#A8C7E2', borderColor: '#3A3A3A', borderRadius: '20px' }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                sx={{ borderRadius: '20px' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : title.includes('Create') ? 'Create' : 'Update'}
              </Button>
            </Box>
          </form>
        </Box>
      </Fade>
    </Modal>
  );
};