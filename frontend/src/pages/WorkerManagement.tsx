import { useEffect, useState, useMemo } from 'react';
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
  Tooltip,
  Chip,
  Fade,
} from '@mui/material';
import {
  BlockRounded as SuspendIcon,
  PlayCircleRounded as ReactivateIcon,
  VpnKeyRounded as ResetPasswordIcon,
  ReplayRounded as ResendResetIcon,
  VerifiedUserRounded as ResendVerificationIcon,
  SortRounded as SortIcon,
} from '@mui/icons-material';

const WorkerManagement = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [newWorker, setNewWorker] = useState({ name: '', email: '' });
  const [sort, setSort] = useState<{ column: keyof Worker['user'] | 'status'; direction: 'asc' | 'desc' }>({
    column: 'name',
    direction: 'asc',
  });

  const statusDisplayText: Record<string, string> = {
    'password-reset': 'Password Reset Pending',
    unverified: 'Account Verification Pending',
    active: 'Active',
    suspended: 'Suspended',
  };

  // Status background colors (light, translucent for dark theme)
  const statusBackgroundColors: Record<string, string> = {
    active: '#4CAF5022', // Soft green
    suspended: '#F4433622', // Pale red
    'password-reset': '#FF980022', // Light orange
    unverified: '#2196F322', // Soft blue
  };

  // Sorted workers
  const sortedWorkers = useMemo(() => {
    return [...workers].sort((a, b) => {
      const aValue = sort.column === 'status' ? a[sort.column] : a.user[sort.column];
      const bValue = sort.column === 'status' ? b[sort.column] : b.user[sort.column];
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }, [workers, sort]);

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const response = await get<Worker[]>('/worker/', undefined, {
        disableToast: true,
      });
      if (response.status === 'success' && response.data) {
        setWorkers(response.data);
      } else {
        setError('Failed to fetch workers: ' + (response.message || 'Unknown error'));
        setWorkers([]);
      }
    } catch (err: any) {
      console.error('Fetch workers error:', err.response?.data || err);
      setError(err.response?.data?.message || 'An error occurred while fetching workers');
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorker = async () => {
    try {
      const response = await post<Worker>('/worker/createWorker', newWorker, undefined);
      if (response.status === 'success' && response.data) {
        await fetchWorkers(); // Refresh the list after creating a new worker
        setNewWorker({ name: '', email: '' });
        setOpenCreateModal(false);
      }
    } catch (err) {
      // Error handling managed by api.ts
    }
  };

  const handleSuspendWorker = async (userId: string) => {
    try {
      await post(`/worker/${userId}/suspend`, undefined, undefined);
      await fetchWorkers();
    } catch (err) {
      // Error handling managed by api.ts
    }
  };

  const handleReactivateWorker = async (userId: string) => {
    try {
      await post(`/worker/${userId}/reactivate`, undefined, undefined);
      await fetchWorkers();
    } catch (err) {
      // Error handling managed by api.ts
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      await post(`/worker/${userId}/reset-password`, undefined, undefined);
      await fetchWorkers();
    } catch (err) {
      // Error handling managed by api.ts
    }
  };

  const handleResendPasswordReset = async (userId: string) => {
    try {
      await post(`/worker/${userId}/resend-password-reset`, undefined, undefined);
      await fetchWorkers();
    } catch (err) {
      // Error handling managed by api.ts
    }
  };

  const handleResendVerification = async (userId: string) => {
    try {
      await post(`/worker/account-verification/${userId}/resend`, undefined, undefined);
      await fetchWorkers();
    } catch (err) {
      // Error handling managed by api.ts
    }
  };

  const handleSort = (column: keyof Worker['user'] | 'status') => {
    setSort((prev) => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
  const isCreateDisabled = !newWorker.name.trim() || !isValidEmail(newWorker.email);

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
    border: '1px solid #3A3A3A',
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#E3F2FD' }}>
        Worker Management
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenCreateModal(true)}
        sx={{ mb: 3, borderRadius: '20px' }}
      >
        Create Worker
      </Button>
      <Fade in={!loading && !error}>
        <Table sx={{ backgroundColor: '#1E1E1E', borderRadius: '8px' }}>
          <TableHead>
            <TableRow>
              <TableCell
                component="th"
                scope="col"
                sx={{ color: '#A8C7E2', cursor: 'pointer' }}
                onClick={() => handleSort('name')}
              >
                Name {sort.column === 'name' && <SortIcon sx={{ fontSize: 16, verticalAlign: 'middle' }} />}
              </TableCell>
              <TableCell
                component="th"
                scope="col"
                sx={{ color: '#A8C7E2', cursor: 'pointer' }}
                onClick={() => handleSort('email')}
              >
                Email {sort.column === 'email' && <SortIcon sx={{ fontSize: 16, verticalAlign: 'middle' }} />}
              </TableCell>
              <TableCell
                component="th"
                scope="col"
                sx={{ color: '#A8C7E2', cursor: 'pointer' }}
                onClick={() => handleSort('status')}
              >
                Status {sort.column === 'status' && <SortIcon sx={{ fontSize: 16, verticalAlign: 'middle' }} />}
              </TableCell>
              <TableCell component="th" scope="col" sx={{ color: '#A8C7E2' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedWorkers.length > 0 ? (
              sortedWorkers.map((worker) => (
                <TableRow
                  key={worker.user.id}
                  sx={{ '&:hover': { backgroundColor: '#2A2A2A' } }}
                >
                  <TableCell sx={{ color: '#E3F2FD' }}>{worker.user.name}</TableCell>
                  <TableCell sx={{ color: '#E3F2FD' }}>{worker.user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={statusDisplayText[worker.status] || worker.status}
                      sx={{
                        color: '#E3F2FD',
                        bgcolor: statusBackgroundColors[worker.status] || '#3A3A3A',

                      }}
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell>
                    {worker.status === 'active' && (
                      <>
                        <Tooltip title="Reset Worker Password">
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() => handleResetPassword(worker.user.id)}
                            sx={{ mr: 1, mb: 1, minWidth: '40px' }}
                            aria-label="Reset worker password"
                          >
                            <ResetPasswordIcon />
                          </Button>
                        </Tooltip>
                        <Tooltip title="Suspend Worker">
                          <Button
                            variant="outlined"
                            color="warning"
                            size="small"
                            onClick={() => handleSuspendWorker(worker.user.id)}
                            sx={{ mr: 1, mb: 1, minWidth: '40px' }}
                            aria-label="Suspend worker"
                          >
                            <SuspendIcon />
                          </Button>
                        </Tooltip>
                      </>
                    )}
                    {worker.status === 'suspended' && (
                      <Tooltip title="Reactivate Worker">
                        <Button
                          variant="outlined"
                          color="success"
                          size="small"
                          onClick={() => handleReactivateWorker(worker.user.id)}
                          sx={{ mr: 1, mb: 1, minWidth: '40px' }}
                          aria-label="Reactivate worker"
                        >
                          <ReactivateIcon />
                        </Button>
                      </Tooltip>
                    )}
                    {worker.status === 'password-reset' && (
                      <>
                        <Tooltip title="Resend Password Reset Email">
                          <Button
                            variant="outlined"
                            color="info"
                            size="small"
                            onClick={() => handleResendPasswordReset(worker.user.id)}
                            sx={{ mr: 1, mb: 1, minWidth: '40px' }}
                            aria-label="Resend password reset email"
                          >
                            <ResendResetIcon />
                          </Button>
                        </Tooltip>
                        <Tooltip title="Suspend Worker">
                          <Button
                            variant="outlined"
                            color="warning"
                            size="small"
                            onClick={() => handleSuspendWorker(worker.user.id)}
                            sx={{ mr: 1, mb: 1, minWidth: '40px' }}
                            aria-label="Suspend worker"
                          >
                            <SuspendIcon />
                          </Button>
                        </Tooltip>
                      </>
                    )}
                    {worker.status === 'unverified' && (
                      <>
                        <Tooltip title="Resend Verification Email">
                          <Button
                            variant="outlined"
                            color="info"
                            size="small"
                            onClick={() => handleResendVerification(worker.user.id)}
                            sx={{ mr: 1, mb: 1, minWidth: '40px' }}
                            aria-label="Resend verification email"
                          >
                            <ResendVerificationIcon />
                          </Button>
                        </Tooltip>
                        <Tooltip title="Suspend Worker">
                          <Button
                            variant="outlined"
                            color="warning"
                            size="small"
                            onClick={() => handleSuspendWorker(worker.user.id)}
                            sx={{ mr: 1, mb: 1, minWidth: '40px' }}
                            aria-label="Suspend worker"
                          >
                            <SuspendIcon />
                          </Button>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Fade in>
                    <Box sx={{ py: 4, color: '#A8C7E2' }}>
                      <Typography variant="h6">No workers found</Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        Get started by adding a new worker.
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setOpenCreateModal(true)}
                        sx={{ borderRadius: '20px' }}
                      >
                        Create Worker
                      </Button>
                    </Box>
                  </Fade>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Fade>
      {loading && (
        <Fade in>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#A8C7E2' }} />
            <Typography sx={{ mt: 2, color: '#A8C7E2' }}>Loading workers...</Typography>
          </Box>
        </Fade>
      )}
      {error && (
        <Fade in>
          <Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>
            {error}
          </Typography>
        </Fade>
      )}
      <Modal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        closeAfterTransition
      >
        <Fade in={openCreateModal}>
          <Box sx={modalStyle}>
            <Typography variant="h6" gutterBottom sx={{ color: '#E3F2FD' }}>
              Create New Worker
            </Typography>
            <TextField
              label="Name"
              value={newWorker.name}
              onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
              fullWidth
              margin="normal"
              InputLabelProps={{ style: { color: '#A8C7E2' } }}
              sx={{ input: { color: '#E3F2FD' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#3A3A3A' } } }}
              error={!newWorker.name.trim()}
              helperText={!newWorker.name.trim() ? 'Name is required' : ''}
            />
            <TextField
              label="Email"
              value={newWorker.email}
              onChange={(e) => setNewWorker({ ...newWorker, email: e.target.value })}
              fullWidth
              margin="normal"
              InputLabelProps={{ style: { color: '#A8C7E2' } }}
              sx={{ input: { color: '#E3F2FD' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#3A3A3A' } } }}
              error={!!newWorker.email && !isValidEmail(newWorker.email)}
              helperText={newWorker.email && !isValidEmail(newWorker.email) ? 'Invalid email format' : ''}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => setOpenCreateModal(false)}
                sx={{ mr: 2, color: '#A8C7E2', borderColor: '#3A3A3A', borderRadius: '20px' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateWorker}
                disabled={isCreateDisabled}
                sx={{ borderRadius: '20px' }}
              >
                Create
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default WorkerManagement;