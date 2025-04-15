import { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Modal,
  CircularProgress,
  Typography,
  IconButton,
  Chip,
  TextField,
  Fade,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { get, post, put, del } from '../services/api';
import { Service } from '../types/index';
import { validateServiceForm } from '../utils/serviceValidations';

interface ServiceFormData {
  name: string;
  price: number;
  estimated_time_minutes: number;
}

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#1E1E1E',
  border: '1px solid #3A3A3A',
  borderRadius: '8px',
  p: 4,
  boxShadow: 24,
};

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [newService, setNewService] = useState<ServiceFormData>({
    name: '',
    price: 0,
    estimated_time_minutes: 0,
  });
  const [editService, setEditService] = useState<Service | null>(null);
  const [editFormData, setEditFormData] = useState<ServiceFormData>({
    name: '',
    price: 0,
    estimated_time_minutes: 0,
  });
  const [createErrors, setCreateErrors] = useState<{ name?: string; price?: string; estimated_time_minutes?: string }>({});
  const [editErrors, setEditErrors] = useState<{ name?: string; price?: string; estimated_time_minutes?: string }>({});

  // Fetch all services on mount
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await get<Service[]>('/services');
        if (response.status === 'success' && response.data) {
          setServices(response.data);
        } else {
          setError('Failed to fetch services');
        }
      } catch {
        setError('An error occurred while fetching services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Create a new service
  const handleCreateService = async () => {
    const validationErrors = validateServiceForm(newService);
    setCreateErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setError('Please fix the errors in the form');
      return;
    }

    setError(null);
    try {
      const response = await post<Service>('/services', newService);
      if (response.status === 'success' && response.data) {
        setServices([...services, response.data]);
        setNewService({ name: '', price: 0, estimated_time_minutes: 0 });
        setOpenCreateModal(false);
        setCreateErrors({});
        toast.success('Service created successfully');
      } else {
        setError('Failed to create service');
      }
    } catch {
      setError('An error occurred while creating the service');
    }
  };

  // Open edit modal and populate form
  const handleEdit = (service: Service) => {
    setEditService(service);
    setEditFormData({
      name: service.name,
      price: service.price,
      estimated_time_minutes: service.estimated_time_minutes,
    });
    setOpenEditModal(true);
    setEditErrors({});
  };

  // Update a service
  const handleUpdateService = async () => {
    if (!editService) return;

    const validationErrors = validateServiceForm(editFormData);
    setEditErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setError('Please fix the errors in the form');
      return;
    }

    setError(null);
    try {
      const response = await put<Service>(`/services/${editService.id}`, editFormData);
      if (response.status === 'success' && response.data) {
        const updatedService = response.data;
        setServices(
          services.map((s) => (s.id === editService.id ? updatedService : s))
        );
        setOpenEditModal(false);
        setEditErrors({});
        toast.success('Service updated successfully');
      } else {
        setError('Failed to update service');
      }
    } catch {
      setError('An error occurred while updating the service');
    }
  };

  // Delete a service
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;

    setError(null);
    try {
      const response = await del(`/services/${id}`);
      if (response.status === 'success') {
        setServices(services.filter((s) => s.id !== id));
      } else {
        setError('Failed to delete service');
      }
    } catch {
      setError('An error occurred while deleting the service');
    }
  };

  // Validate on input change for real-time feedback
  const handleCreateInputChange = (field: keyof ServiceFormData, value: string | number) => {
    const updatedService = { ...newService, [field]: value };
    setNewService(updatedService);
    const validationErrors = validateServiceForm(updatedService);
    setCreateErrors(validationErrors);
  };

  const handleEditInputChange = (field: keyof ServiceFormData, value: string | number) => {
    const updatedFormData = { ...editFormData, [field]: value };
    setEditFormData(updatedFormData);
    const validationErrors = validateServiceForm(updatedFormData);
    setEditErrors(validationErrors);
  };

  // Validation helpers for disabling buttons
  const isCreateDisabled = Object.keys(validateServiceForm(newService)).length > 0;
  const isEditDisabled = Object.keys(validateServiceForm(editFormData)).length > 0;

  if (loading) {
    return (
      <Fade in>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress sx={{ color: '#A8C7E2' }} />
          <Typography sx={{ mt: 2, color: '#A8C7E2' }}>Loading services...</Typography>
        </Box>
      </Fade>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#121212',
        p: 3,
        color: '#E3F2FD',
      }}
    >
      {/* Header with Add Service button */}
        <Typography variant="h4" gutterBottom sx={{ color: '#E3F2FD' }}>
        Services
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenCreateModal(true)}
          sx={{ mb: 3, borderRadius: '20px' }}
        >
          Add Service
        </Button>

      {/* Error Message */}
      {error && (
        <Fade in>
          <Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>
            {error}
          </Typography>
        </Fade>
      )}

      {/* Services Table */}
      <Fade in>
        <Table sx={{ backgroundColor: '#1E1E1E', borderRadius: '8px' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#E3F2FD' }}>Name</TableCell>
              <TableCell sx={{ color: '#E3F2FD' }}>Price (€)</TableCell>
              <TableCell sx={{ color: '#E3F2FD' }}>Estimated Time (min)</TableCell>
              <TableCell sx={{ color: '#E3F2FD' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Fade in>
                    <Box sx={{ py: 4, color: '#A8C7E2' }}>
                      <Typography variant="h6">No services found</Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        Get started by adding a new service.
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setOpenCreateModal(true)}
                        sx={{ borderRadius: '20px' }}
                      >
                        Create Service
                      </Button>
                    </Box>
                  </Fade>
                </TableCell>
              </TableRow>
            ) : (
              services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <Chip
                      label={service.name}
                      sx={{
                        bgcolor: '#4A90E2',
                        color: '#E3F2FD',
                        fontWeight: 'medium',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`€ ${service.price}`}
                      sx={{
                        bgcolor: '#388E3C',
                        color: '#E3F2FD',
                        fontWeight: 'medium',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${service.estimated_time_minutes} min`}
                      sx={{
                        bgcolor: '#FBC02D',
                        color: '#121212',
                        fontWeight: 'medium',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(service)} sx={{ color: '#4A90E2' }}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(service.id)} sx={{ color: '#D32F2F' }}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Fade>

      {/* Create Service Modal */}
      <Modal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        closeAfterTransition
      >
        <Fade in={openCreateModal}>
          <Box sx={modalStyle}>
            <Typography variant="h6" gutterBottom sx={{ color: '#E3F2FD' }}>
              Create New Service
            </Typography>
            <TextField
              label="Service Name"
              value={newService.name}
              onChange={(e) => handleCreateInputChange('name', e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{ style: { color: '#A8C7E2' } }}
              sx={{ input: { color: '#E3F2FD' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#3A3A3A' } } }}
              error={!!createErrors.name}
              helperText={createErrors.name || ''}
            />
            <TextField
              label="Price (€)"
              value={newService.price}
              onChange={(e) => handleCreateInputChange('price', Number(e.target.value))}
              fullWidth
              margin="normal"
              type="number"
              InputLabelProps={{ style: { color: '#A8C7E2' } }}
              sx={{
                input: { color: '#E3F2FD' },
                '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#3A3A3A' } },
                '& input[type=number]': { '-moz-appearance': 'textfield' },
                '& input[type=number]::-webkit-outer-spin-button': { '-webkit-appearance': 'none', margin: 0 },
                '& input[type=number]::-webkit-inner-spin-button': { '-webkit-appearance': 'none', margin: 0 },
              }}
              error={!!createErrors.price}
              helperText={createErrors.price || ''}
            />
            <TextField
              label="Estimated Time (minutes)"
              value={newService.estimated_time_minutes}
              onChange={(e) => handleCreateInputChange('estimated_time_minutes', Number(e.target.value))}
              fullWidth
              margin="normal"
              type="number"
              InputLabelProps={{ style: { color: '#A8C7E2' } }}
              sx={{
                input: { color: '#E3F2FD' },
                '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#3A3A3A' } },
                '& input[type=number]': { '-moz-appearance': 'textfield' },
                '& input[type=number]::-webkit-outer-spin-button': { '-webkit-appearance': 'none', margin: 0 },
                '& input[type=number]::-webkit-inner-spin-button': { '-webkit-appearance': 'none', margin: 0 },
              }}
              error={!!createErrors.estimated_time_minutes}
              helperText={createErrors.estimated_time_minutes || ''}
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
                onClick={handleCreateService}
                disabled={isCreateDisabled}
                sx={{ borderRadius: '20px' }}
              >
                Create
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* Edit Service Modal */}
      <Modal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        closeAfterTransition
      >
        <Fade in={openEditModal}>
          <Box sx={modalStyle}>
            <Typography variant="h6" gutterBottom sx={{ color: '#E3F2FD' }}>
              Edit Service
            </Typography>
            <TextField
              label="Service Name"
              value={editFormData.name}
              onChange={(e) => handleEditInputChange('name', e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{ style: { color: '#A8C7E2' } }}
              sx={{ input: { color: '#E3F2FD' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#3A3A3A' } } }}
              error={!!editErrors.name}
              helperText={editErrors.name || ''}
            />
            <TextField
              label="Price (€)"
              value={editFormData.price}
              onChange={(e) => handleEditInputChange('price', Number(e.target.value))}
              fullWidth
              margin="normal"
              type="number"
              InputLabelProps={{ style: { color: '#A8C7E2' } }}
              sx={{
                input: { color: '#E3F2FD' },
                '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#3A3A3A' } },
                '& input[type=number]': { '-moz-appearance': 'textfield' },
                '& input[type=number]::-webkit-outer-spin-button': { '-webkit-appearance': 'none', margin: 0 },
                '& input[type=number]::-webkit-inner-spin-button': { '-webkit-appearance': 'none', margin: 0 },
              }}
              error={!!editErrors.price}
              helperText={editErrors.price || ''}
            />
            <TextField
              label="Estimated Time (minutes)"
              value={editFormData.estimated_time_minutes}
              onChange={(e) => handleEditInputChange('estimated_time_minutes', Number(e.target.value))}
              fullWidth
              margin="normal"
              type="number"
              InputLabelProps={{ style: { color: '#A8C7E2' } }}
              sx={{
                input: { color: '#E3F2FD' },
                '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#3A3A3A' } },
                '& input[type=number]': { '-moz-appearance': 'textfield' },
                '& input[type=number]::-webkit-outer-spin-button': { '-webkit-appearance': 'none', margin: 0 },
                '& input[type=number]::-webkit-inner-spin-button': { '-webkit-appearance': 'none', margin: 0 },
              }}
              error={!!editErrors.estimated_time_minutes}
              helperText={editErrors.estimated_time_minutes || ''}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => setOpenEditModal(false)}
                sx={{ mr: 2, color: '#A8C7E2', borderColor: '#3A3A3A', borderRadius: '20px' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpdateService}
                disabled={isEditDisabled}
                sx={{ borderRadius: '20px' }}
              >
                Update
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default Services;