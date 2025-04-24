import { useState, useEffect, JSX } from 'react';
import { Modal, Fade, Box, Typography, Button } from '@mui/material';

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

type PromptModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string | JSX.Element; 
  cancelLabel?: string;
  confirmLabel?: string;
  confirmColor?: string; 
};

export const PromptModal = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  confirmColor,
}: PromptModalProps) => {
  const [visible, setVisible] = useState(open);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setVisible(open);
  }, [open]);

  const handleLocalClose = () => setVisible(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
      handleLocalClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal open={open} onClose={handleLocalClose} closeAfterTransition>
      <Fade in={visible} onExited={onClose} timeout={300}>
        <Box sx={modalStyle}>
          <Typography
            variant="h6"
            sx={{ color: '#E8ECEF', fontSize: '1.25rem', fontWeight: 500, mb: 2 }}
          >
            {title}
          </Typography>
          <Typography
            sx={{ color: '#E8ECEF', fontSize: '0.875rem', mb: 3, textAlign: 'center' }}
          >
            {message}
          </Typography>
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
              disabled={isProcessing}
            >
              {cancelLabel}
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirm}
              sx={{
                bgcolor: confirmColor
                  ? `linear-gradient(45deg, ${confirmColor}, ${lightenColor(confirmColor, 20)})`
                  : 'linear-gradient(45deg, #4A90E2, #42A5F5)',
                color: '#E8ECEF',
                borderRadius: '12px',
                fontSize: '0.875rem',
                px: 2,
                py: 0.5,
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  bgcolor: confirmColor
                    ? `linear-gradient(45deg, ${darkenColor(confirmColor, 20)}, ${confirmColor})`
                    : 'linear-gradient(45deg, #357ABD, #2196F3)',
                },
              }}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : confirmLabel}
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

// Helper functions to lighten/darken colors for gradients
const lightenColor = (color: string, percent: number) => {
  const num = parseInt(color.replace('#', ''), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    G = ((num >> 8) & 0x00ff) + amt,
    B = (num & 0x0000ff) + amt;
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)}`;
};

const darkenColor = (color: string, percent: number) => {
  const num = parseInt(color.replace('#', ''), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) - amt,
    G = ((num >> 8) & 0x00ff) - amt,
    B = (num & 0x0000ff) - amt;
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)}`;
};