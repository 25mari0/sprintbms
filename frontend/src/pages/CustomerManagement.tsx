import { useState, useEffect } from 'react';
import { Box, Typography, Fade, Button, CircularProgress, TextField } from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import { get, post } from '../services/api';
import { Customer, CustomersResponse } from '../types/customerTypes';
import { Meta } from '../types/index';
import CustomerTable from '../components/Customers/CustomerTable';
import { CustomerFormModal } from '../components/Customers/CustomerFormModal';
import { CustomerFormData } from '../utils/customerValidations';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editCustomerId, setEditCustomerId] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form hooks
  const createForm = useForm<CustomerFormData>({
    defaultValues: { name: '', phone: '' },
  });
  const editForm = useForm<CustomerFormData>({
    defaultValues: { name: '', phone: '' },
  });

  const loadCustomers = async (targetPage: number, searchQuery: string = '') => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: targetPage.toString(),
        limit: rowsPerPage.toString(),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await get<CustomersResponse>(
        `/customer/?${queryParams.toString()}`,
        undefined,
        { disableToast: true }
      );
      if (response.status === 'success' && response.data) {
        setCustomers(response.data.data || []);
        setMeta(response.data.meta || { total: 0, page: 1, limit: 20, totalPages: 1 });
      } else {
        setError('Failed to fetch customers');
        setCustomers([]);
        setMeta({ total: 0, page: 1, limit: 20, totalPages: 1 });
      }
    } catch (err: any) {
      console.error('Error fetching customers:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred while fetching customers');
      setCustomers([]);
      setMeta({ total: 0, page: 1, limit: 20, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers(page);
  }, [page, rowsPerPage, search]);

  const handlePageChange = (newPage: number) => {
    if (newPage === page) {
      loadCustomers(newPage);
    } else {
      setPage(newPage);
    }
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };

  const handleSearch = () => {
    setPage(1); 
    loadCustomers(1, search);
  };

  const handleCreateCustomer = async (data: CustomerFormData) => {
    setIsSubmitting(true);
    setModalError(null);
    try {
      const response = await post<Customer>('/customer/', data);
      if (response.status === 'success' && response.data) {
        await loadCustomers(page);
        createForm.reset();
        setOpenCreateModal(false);
        toast.success('Customer created successfully');
      } else {
        setModalError('Failed to create customer');
      }
    } catch (err: any) {
      console.error('Error creating customer:', err);
      setModalError(err.response?.data?.message || err.message || 'An error occurred while creating the customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    editForm.reset({ name: customer.name, phone: customer.phone });
    setEditCustomerId(customer.id);
    setOpenEditModal(true);
  };

  const handleUpdateCustomer = async (data: CustomerFormData) => {
    if (!editCustomerId) return;
    setIsSubmitting(true);
    setModalError(null);
    try {
      const response = await post<Customer>(`/customer/${editCustomerId}`, data, { method: 'PATCH' });
      if (response.status === 'success' && response.data) {
        await loadCustomers(page);
        editForm.reset();
        setOpenEditModal(false);
        setEditCustomerId(null);
        toast.success('Customer updated successfully');
      } else {
        setModalError('Failed to update customer');
      }
    } catch (err: any) {
      console.error('Error updating customer:', err);
      setModalError(err.response?.data?.message || err.message || 'An error occurred while updating the customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await post<unknown>(`/customer/${id}`, null, { method: 'DELETE' });
        await loadCustomers(page);
        toast.success('Customer deleted successfully');
      } catch (err: any) {
        console.error('Error deleting customer:', err);
        toast.error(err.response?.data?.message || err.message || 'Failed to delete customer');
      }
    }
  };

  const handleClearSearch = () => {
    setSearch('');
    setPage(1);
  };

  return (
    <Box sx={{ p: 4, minHeight: '100vh', bgcolor: '#121212', color: '#E3F2FD' }}>
      <Typography variant="h4" gutterBottom>
        Customer Management
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Search Customers"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ input: { color: '#E3F2FD' }, '& .MuiInputLabel-root': { color: '#A8C7E2' } }}
        />
        <Button
          variant="contained"
          startIcon={<Search />}
          onClick={handleSearch}
          sx={{ borderRadius: '20px' }}
        >
          Search
        </Button>
        <Button variant="outlined" onClick={handleClearSearch} sx={{ color: '#A8C7E2', borderColor: '#3A3A3A' }}>
          Clear Search
        </Button>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenCreateModal(true)}
          sx={{ borderRadius: '20px' }}
        >
          Add Customer
        </Button>
      </Box>
      {error && (
        <Fade in>
          <Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>
            {error}
          </Typography>
        </Fade>
      )}
      <Box sx={{ position: 'relative' }}>
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1,
            }}
          >
            <CircularProgress sx={{ color: '#A8C7E2' }} />
          </Box>
        )}
        <CustomerTable
          customers={customers}
          meta={meta}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onEdit={handleEditCustomer}
          onDelete={handleDeleteCustomer}
        />
      </Box>
      <CustomerFormModal
        open={openCreateModal}
        onClose={() => {
          setOpenCreateModal(false);
          createForm.reset();
        }}
        onSubmit={handleCreateCustomer}
        modalError={modalError}
        isSubmitting={isSubmitting}
        form={createForm}
        title="Create New Customer"
      />
      <CustomerFormModal
        open={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          editForm.reset();
          setEditCustomerId(null);
        }}
        onSubmit={handleUpdateCustomer}
        modalError={modalError}
        isSubmitting={isSubmitting}
        form={editForm}
        title="Edit Customer"
      />
    </Box>
  );
};

export default CustomerManagement;