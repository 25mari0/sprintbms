import { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Typography, Fade } from '@mui/material';
import { Add } from '@mui/icons-material';
import { get, post, put, del } from '../services/api';
import { Service } from '../types/serviceTypes';
import { useForm } from 'react-hook-form';
import { ServiceFormModal } from '../components/Services/ServiceFormModal';
import { ServiceTable } from '../components/Services/ServiceTable';
import { validateServiceForm } from '../utils/serviceValidations';

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editServiceId, setEditServiceId] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createForm = useForm<Service>({ defaultValues: { name: '', price: 0, estimated_time_minutes: 0 } });
  const editForm = useForm<Service>({ defaultValues: { name: '', price: 0, estimated_time_minutes: 0 } });

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await get<Service[]>('/services', undefined, { disableToast: true });
        if (response.status === 'success' && response.data) setServices(response.data);
        else setError(`Failed to fetch services: ${response.message || 'Unknown error'}`);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleCreateService =  
    async (data: Service, localClose: () => void) => {
      setIsSubmitting(true);
      setModalError(null);
      const validationErrors = validateServiceForm(data);
      if (Object.keys(validationErrors).length > 0) {
        setModalError('Please fix the errors in the form');
        createForm.setError('name', { message: validationErrors.name });
        createForm.setError('price', { message: validationErrors.price });
        createForm.setError('estimated_time_minutes', {
          message: validationErrors.estimated_time_minutes,
        });
        setIsSubmitting(false);
        return;
      }
      try {
        const response = await post<Service>('/services', data);
        if (response.status === 'success' && response.data) {
          setServices([...services, response.data]);
          // Do not reset here—wait until after fade-out
          setModalError(null);
          // Trigger fade-out transition.
          localClose();
        } else {
          setModalError(`Failed to create service: ${response.message || 'Unknown error'}`);
        }
      } catch (err: unknown) {
        console.error('Error creating service:', err);
        setModalError(
          err instanceof Error ? err.message : 'An error occurred while creating the service'
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  const handleEdit = 
  (service: Service) => {
    setEditServiceId(service.id);
    editForm.reset({
      name: service.name,
      price: service.price,
      estimated_time_minutes: service.estimated_time_minutes,
    });
    setOpenEditModal(true);
    setModalError(null);
  };

  const handleUpdateService = 
    async (data: Service, localClose: () => void) => {
      if (!editServiceId) return;
      setIsSubmitting(true);
      setModalError(null);
      const validationErrors = validateServiceForm(data);
      if (Object.keys(validationErrors).length > 0) {
        setModalError('Please fix the errors in the form');
        editForm.setError('name', { message: validationErrors.name });
        editForm.setError('price', { message: validationErrors.price });
        editForm.setError('estimated_time_minutes', {
          message: validationErrors.estimated_time_minutes,
        });
        setIsSubmitting(false);
        return;
      }

      try {
        const response = await put<Service>(`/services/${editServiceId}`, data);
        if (response.status === 'success' && response.data) {
          const updatedService = response.data;
          setServices(services.map((s) => (s.id === editServiceId ? updatedService : s)));
          // Do not reset form values immediately; let them persist during fade-out.
          setModalError(null);
          // Trigger fade-out transition.
          localClose();
        } else {
          setModalError(`Failed to update service: ${response.message || 'Unknown error'}`);
        }
      } catch (err: unknown) {
        console.error('Error updating service:', err);
        setModalError(
          err instanceof Error ? err.message : 'An error occurred while updating the service'
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  const handleDelete = 
    async (id: string) => {
      if (!window.confirm('Are you sure you want to delete this service?')) return;

      try {
        const response = await del(`/services/${id}`);
        if (response.status === 'success') {
          setServices(services.filter((s) => s.id !== id));
        } else {
          setError(`Failed to delete service: ${response.message || 'Unknown error'}`);
        }
      } catch (err: unknown) {
        console.error('Error deleting service:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while deleting the service');
      }
    };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#121212', p: 3, color: '#E3F2FD' }}>
      <Typography variant="h4" gutterBottom>Services</Typography>
      <Button variant="contained" startIcon={<Add />} onClick={() => setOpenCreateModal(true)} sx={{ mb: 3, borderRadius: '20px' }}>
        Add Service
      </Button>

      {error && <Fade in><Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>{error}</Typography></Fade>}
      {!loading && !error && <ServiceTable services={services} onEdit={handleEdit} onDelete={handleDelete} />}
      {loading && (
        <Fade in>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#A8C7E2' }} />
            <Typography sx={{ mt: 2, color: '#A8C7E2' }}>Loading services...</Typography>
          </Box>
        </Fade>
      )}

      <ServiceFormModal open={openCreateModal} onClose={() => { setOpenCreateModal(false); createForm.reset(); }} onSubmit={handleCreateService} form={createForm} title="Create New Service" isSubmitting={isSubmitting} modalError={modalError} />
      <ServiceFormModal open={openEditModal} onClose={() => { setOpenEditModal(false); editForm.reset(); }} onSubmit={handleUpdateService} form={editForm} title="Edit Service" isSubmitting={isSubmitting} modalError={modalError} />
    </Box>
  );
};

export default Services;