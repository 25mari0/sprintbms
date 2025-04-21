import { useState, useEffect } from 'react';
import { Box, Modal, Fade, Typography, Button } from '@mui/material';
import { useForm } from 'react-hook-form';
import { FormField } from '../FormField';
import {
  serviceNameValidation,
  priceValidation,
  estimatedTimeValidation,
} from '../../utils/serviceValidations';
import { Service } from '../../types/serviceTypes'; // Adjust path as needed

type ServiceFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Service, localClose: () => void) => Promise<void>;
  form: ReturnType<typeof useForm<Service>>;
  title: string;
  isSubmitting?: boolean;
  modalError?: string | null;
};

export const ServiceFormModal = ({
  open,
  onClose,
  onSubmit,
  form,
  title,
  isSubmitting = false,
  modalError = null,
}: ServiceFormModalProps) => {
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

  const handleFormSubmit = async (data: Service) => {
    await onSubmit(data, handleLocalClose);
  };

  const formFieldStyles = {
    InputLabelProps: { style: { color: '#A8C7E2' } },
    sx: {
      input: { color: '#E3F2FD' },
      '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#3A3A3A' } },
    },
  };

  return (
    <Modal open={open} onClose={handleLocalClose} closeAfterTransition>
      <Fade in={visible} onExited={onClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: '#1E1E1E',
            border: '1px solid #3A3A3A',
            borderRadius: '8px',
            p: 4,
            boxShadow: 24,
            color: '#E3F2FD',
          }}
        >
          <Typography variant="h5" component="h1" gutterBottom align="center">
            {title}
          </Typography>
          {modalError && (
            <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
              {modalError}
            </Typography>
          )}
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <FormField
              label="Service Name"
              register={register('name', serviceNameValidation)}
              error={errors.name}
              disabled={isSubmitting}
              {...formFieldStyles}
            />
            <FormField
              label="Price (€)"
              type="number"
              register={register('price', { ...priceValidation, valueAsNumber: true })}
              error={errors.price}
              disabled={isSubmitting}
              {...formFieldStyles}
            />
            <FormField
              label="Estimated Time (minutes)"
              type="number"
              register={register('estimated_time_minutes', {
                ...estimatedTimeValidation,
                valueAsNumber: true,
              })}
              error={errors.estimated_time_minutes}
              disabled={isSubmitting}
              {...formFieldStyles}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleLocalClose}
                sx={{
                  mr: 2,
                  color: '#A8C7E2',
                  borderColor: '#3A3A3A',
                  borderRadius: '20px',
                }}
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
