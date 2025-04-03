import React from 'react';
import { Modal, Box, Typography } from '@mui/material';

interface BookingFormModalProps {
  open: boolean;
  onClose: () => void;
}

const BookingFormModal: React.FC<BookingFormModalProps> = ({ open, onClose }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', p: 4, borderRadius: 2 }}>
        <Typography variant="h6">Booking Form (Placeholder)</Typography>
        <Typography>This will be implemented for creating/editing bookings.</Typography>
      </Box>
    </Modal>
  );
};

export default BookingFormModal;