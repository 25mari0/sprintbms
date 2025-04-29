import { useState, useEffect } from 'react';
import { Box, Typography, Fade, CircularProgress } from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import { get, post } from '../services/api';
import { Customer, CustomersResponse } from '../types/customerTypes';
import { Meta } from '../types/index';
import CustomerTable from '../components/Customers/CustomerTable';
import { FormModal } from '../components/FormModal';
import { PromptModal } from '../components/PromptModal';
import { CustomButton } from '../components/CustomButton';
import { TextBox } from '../components/TextBox';
import { CustomerFormData, customerPhoneValidation } from '../utils/customerValidations';
import { nameValidation as customerNameValidation } from '../utils/userValidations';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>(''); // Keep original variable name
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteCustomer, setDeleteCustomer] = useState<{ id: string; name: string } | null>(null);
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

  // Define customer form fields with explicit Path<CustomerFormData>
  const customerFields = [
    { label: 'Name', name: 'name' as 'name', validation: customerNameValidation },
    { label: 'Phone', name: 'phone' as 'phone', validation: customerPhoneValidation },
  ];

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
  }, [page, rowsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage === page) {
      loadCustomers(newPage, search);
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
        await loadCustomers(page, search);
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
        await loadCustomers(page, search);
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

  const handleDeleteCustomer = (id: string, name: string) => {
    setDeleteCustomer({ id, name });
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteCustomer) return;
    try {
      await post<unknown>(`/customer/${deleteCustomer.id}`, null, { method: 'DELETE' });
      await loadCustomers(page, search);
      toast.success('Customer deleted successfully');
    } catch (err: any) {
      console.error('Error deleting customer:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to delete customer');
    } finally {
      setDeleteCustomer(null);
    }
  };

  const handleClearSearch = () => {
    setSearch('');
    setPage(1);
    loadCustomers(1);
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: '#121212', color: '#E8ECEF' }}>
      <Typography
        variant="h4"
        sx={{ fontSize: '1.75rem', fontWeight: 500, mb: 2, letterSpacing: '0.5px' }}
      >
        Customer Management
      </Typography>
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          mb: 2,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <TextBox
          label="Search Customers"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <CustomButton
          startIcon={<Search />}
          onClick={handleSearch}
        >
          Search
        </CustomButton>
        <CustomButton
          customVariant="secondary"
          onClick={handleClearSearch}
        >
          Clear
        </CustomButton>
        <CustomButton
          startIcon={<Add />}
          onClick={() => setOpenCreateModal(true)}
        >
          Add Customer
        </CustomButton>
      </Box>
      {error && (
        <Fade in>
          <Typography sx={{ color: '#D81B60', fontSize: '0.875rem', textAlign: 'center', mt: 2 }}>
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
            <CircularProgress sx={{ color: '#4A90E2' }} size={32} />
          </Box>
        )}
        <CustomerTable
          customers={customers}
          meta={meta}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onEdit={handleEditCustomer}
          onDelete={(id) => {
            const customer = customers.find((c) => c.id === id);
            if (customer) handleDeleteCustomer(id, customer.name);
          }}
        />
      </Box>
      <FormModal<CustomerFormData>
        open={openCreateModal}
        onClose={() => {
          setOpenCreateModal(false);
          createForm.reset();
        }}
        onSubmit={handleCreateCustomer}
        form={createForm}
        title="Create New Customer"
        fields={customerFields}
        modalError={modalError}
        isSubmitting={isSubmitting}
        submitLabel="Create"
      />
      <FormModal<CustomerFormData>
        open={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          editForm.reset();
          setEditCustomerId(null);
        }}
        onSubmit={handleUpdateCustomer}
        form={editForm}
        title="Edit Customer"
        fields={customerFields}
        modalError={modalError}
        isSubmitting={isSubmitting}
        submitLabel="Update"
      />
      <PromptModal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setDeleteCustomer(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={
          <span>
            Are you sure you want to delete customer{' '}
            <strong style={{ color: '#D81B60' }}>{deleteCustomer?.name || ''}</strong>? This action cannot be undone.
          </span>
        }
        cancelLabel="Cancel"
        confirmLabel="Delete"
        confirmColor="#D81B60"
      />
    </Box>
  );
};

export default CustomerManagement;