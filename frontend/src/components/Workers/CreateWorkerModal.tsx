import { Modal, Fade, Box, Typography, Button } from '@mui/material';
import { UseFormReturn } from 'react-hook-form';
import { FormField } from '../FormField';
import { WorkerFormData } from '../../types/workerTypes';
import { nameValidation, emailValidation } from '../../utils/userValidations';
import { useEffect, useState } from 'react';

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
};

const formFieldStyles = {
  InputLabelProps: { style: { color: '#A8C7E2' } },
  sx: {
    input: { color: '#E3F2FD' },
    '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#3A3A3A' } },
  },
};

type CreateWorkerModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: WorkerFormData) => void;
  modalError: string | null;
  isSubmitting: boolean;
  form: UseFormReturn<WorkerFormData>;
  title: string;
};

export const CreateWorkerModal = ({
  open,
  onClose,
  onSubmit,
  modalError,
  isSubmitting,
  form,
  title,
}: CreateWorkerModalProps) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = form;
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
          {modalError && (
            <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
              {modalError}
            </Typography>
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormField
              label="Name"
              register={register('name', nameValidation)}
              error={errors.name}
              disabled={isSubmitting}
              {...formFieldStyles}
            />
            <FormField
              label="Email"
              register={register('email', emailValidation)}
              error={errors.email}
              disabled={isSubmitting}
              {...formFieldStyles}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleLocalClose}
                sx={{ mr: 2, color: '#A8C7E2', borderRadius: '20px' }}
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
                {isSubmitting ? 'Submitting...' : 'Create'}
              </Button>
            </Box>
          </form>
        </Box>
      </Fade>
    </Modal>
  );
};
