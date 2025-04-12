// frontend/src/pages/WorkerManagement.tsx
import { useEffect, useState } from 'react';
import { get, post } from '../services/api';
import { Worker } from '../types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Modal,
  TextField,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';

const WorkerManagement = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [newWorker, setNewWorker] = useState({ name: '', email: '' });

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const response = await get<Worker[]>('/worker/', undefined, {
        disableToast: true,
      });
      console.log('GET /worker/ response:', response); // Debug
      if (response.status === 'success' && response.data) {
        setWorkers(response.data); // Directly use response.data (Worker[])
      } else {
        setError('Failed to fetch workers: ' + (response.message || 'Unknown error'));
        setWorkers([]); // Clear workers on error
      }
    } catch (err: any) {
      console.error('Fetch workers error:', err.response?.data || err);
      setError(err.response?.data?.message || 'An error occurred while fetching workers');
      setWorkers([]); // Clear workers on error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorker = async () => {
    try {
      const response = await post<Worker>('/worker/createWorker', newWorker, undefined, {
        toastMessage: 'Worker created successfully!',
      });
      if (response.status === 'success' && response.data) {
        setWorkers([...workers, response.data]); // response.data is Worker
        setOpenCreateModal(false);
        setNewWorker({ name: '', email: '' });
      }
    } catch (err) {
      // Error toast handled by api.ts
    }
  };

  const handleSuspendWorker = async (userId: string) => {
    try {
      await post(`/worker/${userId}/suspend`, undefined, undefined, {
        toastMessage: 'Worker suspended successfully!',
      });
      await fetchWorkers();
    } catch (err) {
      // Error toast handled by api.ts
    }
  };

  const handleReactivateWorker = async (userId: string) => {
    try {
      await post(`/worker/${userId}/reactivate`, undefined, undefined, {
        toastMessage: 'Worker reactivated successfully!',
      });
      await fetchWorkers();
    } catch (err) {
      // Error toast handled by api.ts
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      await post(`/worker/${userId}/reset-password`, undefined, undefined, {
        toastMessage: 'Password reset email sent!',
      });
      await fetchWorkers();
    } catch (err) {
      // Error toast handled by api.ts
    }
  };

  const handleResendPasswordReset = async (userId: string) => {
    try {
      await post(`/worker/${userId}/resend-password-reset`, undefined, undefined, {
        toastMessage: 'Password reset email resent!',
      });
    } catch (err) {
      // Error toast handled by api.ts
    }
  };

  const handleResendVerification = async (userId: string) => {
    try {
      await post(`/worker/account-verification/${userId}/resend`, undefined, undefined, {
        toastMessage: 'Verification email resent!',
      });
    } catch (err) {
      // Error toast handled by api.ts
    }
  };

  const modalStyle = {
    position: 'absolute' as 'absolute',
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

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;
  if (error) return <Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>{error}</Typography>;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Worker Management
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenCreateModal(true)}
        sx={{ mb: 2 }}
      >
        Create Worker
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {workers.length > 0 ? (
            workers.map((worker) => (
              <TableRow key={worker.user.id}>
                <TableCell>{worker.user.name}</TableCell>
                <TableCell>{worker.user.email}</TableCell>
                <TableCell>{worker.status}</TableCell>
                <TableCell>
                  {worker.status !== 'suspended' && (
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={() => handleSuspendWorker(worker.user.id)}
                      sx={{ mr: 1, mb: 1 }}
                    >
                      Suspend
                    </Button>
                  )}
                  {worker.status === 'suspended' && (
                    <Button
                      variant="outlined"
                      color="success"
                      onClick={() => handleReactivateWorker(worker.user.id)}
                      sx={{ mr: 1, mb: 1 }}
                    >
                      Reactivate
                    </Button>
                  )}
                  {worker.status !== 'suspended' && (
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleResetPassword(worker.user.id)}
                      sx={{ mr: 1, mb: 1 }}
                    >
                      Reset Password
                    </Button>
                  )}
                  {worker.status === 'password-reset' && (
                    <Button
                      variant="outlined"
                      color="info"
                      onClick={() => handleResendPasswordReset(worker.user.id)}
                      sx={{ mr: 1, mb: 1 }}
                    >
                      Resend Reset
                    </Button>
                  )}
                  {worker.status === 'unverified' && (
                    <Button
                      variant="outlined"
                      color="info"
                      onClick={() => handleResendVerification(worker.user.id)}
                      sx={{ mr: 1, mb: 1 }}
                    >
                      Resend Verification
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} align="center">
                No workers found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal open={openCreateModal} onClose={() => setOpenCreateModal(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
            Create New Worker
          </Typography>
          <TextField
            label="Name"
            value={newWorker.name}
            onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
            fullWidth
            margin="normal"
            InputLabelProps={{ style: { color: '#A8C7E2' } }}
            sx={{ input: { color: '#E3F2FD' } }}
          />
          <TextField
            label="Email"
            value={newWorker.email}
            onChange={(e) => setNewWorker({ ...newWorker, email: e.target.value })}
            fullWidth
            margin="normal"
            InputLabelProps={{ style: { color: '#A8C7E2' } }}
            sx={{ input: { color: '#E3F2FD' } }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateWorker}
            sx={{ mt: 2 }}
          >
            Create
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default WorkerManagement;