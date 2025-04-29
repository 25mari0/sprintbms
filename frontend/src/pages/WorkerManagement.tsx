import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Fade, CircularProgress } from '@mui/material';
import { Add } from '@mui/icons-material';
import { get, post } from '../services/api';
import { Worker, WorkerFormData } from '../types/workerTypes';
import { WorkerTable } from '../components/Workers/WorkerTable';
import { FormModal } from '../components/FormModal';
import { useForm } from 'react-hook-form';
import { CustomButton } from '../components/CustomButton';
import { nameValidation, emailValidation } from '../utils/userValidations';

const WorkerManagement = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sort, setSort] = useState<{ column: keyof Worker['user'] | 'status'; direction: 'asc' | 'desc' }>({
    column: 'name',
    direction: 'asc',
  });

  // Form hook for create worker
  const createForm = useForm<WorkerFormData>({
    defaultValues: { name: '', email: '' },
  });

  // Sorted workers with useMemo
  const sortedWorkers = useMemo(() => {
    return [...workers].sort((a, b) => {
      const aValue = sort.column === 'status' ? a[sort.column] : a.user[sort.column];
      const bValue = sort.column === 'status' ? b[sort.column] : b.user[sort.column];
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }, [workers, sort]);

  // Fetch workers function
  const fetchWorkers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await get<Worker[]>('/worker/', undefined, { disableToast: true });
      if (response.status === 'success' && response.data) {
        setWorkers(response.data);
      } else {
        setError(`Failed to fetch workers: ${response.message || 'Unknown error'}`);
        setWorkers([]);
      }
    } catch (err: any) {
      console.error('Fetch workers error:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred while fetching workers');
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch workers on mount
  useEffect(() => {
    fetchWorkers();
  }, []);

  // Generic action handler
  const handleAction = async (url: string) => {
    try {
      await post(url, undefined, undefined);
      await fetchWorkers();
    } catch (err: any) {
      console.error('Action error:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred during the action');
    }
  };

  // Create worker handler
  const handleCreateWorker = async (data: WorkerFormData) => {
    setIsSubmitting(true);
    setModalError(null);
    try {
      const response = await post<Worker>('/worker/createWorker', data);
      if (response.status === 'success' && response.data) {
        await fetchWorkers();
        createForm.reset();
        setOpenCreateModal(false);
        setModalError(null);
      } else {
        setModalError(`Failed to create worker: ${response.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Error creating worker:', err);
      setModalError(err.response?.data?.message || err.message || 'An error occurred while creating the worker');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Specific action handlers
  const handleSuspendWorker = (userId: string) => handleAction(`/worker/${userId}/suspend`);
  const handleReactivateWorker = (userId: string) => handleAction(`/worker/${userId}/reactivate`);
  const handleResetPassword = (userId: string) => handleAction(`/worker/${userId}/reset-password`);
  const handleResendPasswordReset = (userId: string) => handleAction(`/worker/${userId}/resend-password-reset`);
  const handleResendVerification = (userId: string) => handleAction(`/worker/account-verification/${userId}/resend`);

  // Sort handler
  const handleSort = (column: keyof Worker['user'] | 'status') => {
    setSort((prev) => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <Box sx={{ p: 4, minHeight: '100vh', bgcolor: '#121212', color: '#E3F2FD' }}>
      <Typography variant="h4" gutterBottom>
        Worker Management
      </Typography>
      <CustomButton
        startIcon={<Add />}
        onClick={() => setOpenCreateModal(true)}
        sx={{ mb: 2 }}
      >
        Add Worker
      </CustomButton>
      {error && (
        <Fade in>
          <Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>
            {error}
          </Typography>
        </Fade>
      )}
      <Fade in={!loading && !error}>
        <Box>
          <WorkerTable
            workers={sortedWorkers}
            sort={sort}
            onSort={handleSort}
            onCreateClick={() => setOpenCreateModal(true)}
            onSuspend={handleSuspendWorker}
            onReactivate={handleReactivateWorker}
            onResetPassword={handleResetPassword}
            onResendPasswordReset={handleResendPasswordReset}
            onResendVerification={handleResendVerification}
          />
        </Box>
      </Fade>
      {loading && (
        <Fade in>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#A8C7E2' }} />
            <Typography sx={{ mt: 2, color: '#A8C7E2' }}>Loading workers...</Typography>
          </Box>
        </Fade>
      )}
      <FormModal<WorkerFormData>
        open={openCreateModal}
        onClose={() => {
          setOpenCreateModal(false);
          createForm.reset();
        }}
        onSubmit={handleCreateWorker}
        form={createForm}
        title="Create New Worker"
        fields={[
          { label: 'Name', name: 'name' as 'name', validation: nameValidation },
          { label: 'Email', name: 'email' as 'email', validation: emailValidation },
        ]}
        modalError={modalError}
        isSubmitting={isSubmitting}
        submitLabel="Create"
      />
    </Box>
  );
};

export default WorkerManagement;