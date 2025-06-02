import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import {
  Modal,
  Fade,
  Box,
  Typography,
  TextField,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
  Stack,
} from '@mui/material';
import LocalPhoneRoundedIcon from '@mui/icons-material/LocalPhoneRounded';
import Autocomplete from '@mui/material/Autocomplete';
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form';
import { get, post } from '../../services/api';
import { Service } from '../../types/serviceTypes';
import { Customer, CustomersResponse } from '../../types/customerTypes';
import { Worker } from '../../types/workerTypes';
import { CustomButton } from '../CustomButton';
import DatePicker from '../DatePicker';
import { SearchDropdown } from '../SearchDropdown';

// Styles
const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  maxHeight: '90vh',
  overflowY: 'auto',
  bgcolor: 'rgba(30,30,30,0.95)',
  backdropFilter: 'blur(8px)',
  color: '#E8ECEF',
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  p: 3,
  borderRadius: '12px',
  border: '1px solid #2A2A2A',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 2,
};

// Types
interface CreateBookingForm {
  customerId: string;
  licensePlate: string;
  pickupDate: string;
  workers: { workerId: string }[];
  services: { serviceId: number; name: string; basePrice: number; price: number }[];
}

interface BookingService {
  serviceId: number;
  name: string;
  basePrice: number;
  price: number;
}

// Sub-components
const ServiceSelector = memo(({
  options,
  loading,
  selected,
  onChange
}: {
  options: Service[];
  loading: boolean;
  selected: Service[];
  onChange: (e: any, v: Service[]) => void;
}) => (
  <Autocomplete<Service, true, false, false>
    multiple
    options={options}
    getOptionLabel={s => s.name}
    value={selected}
    onChange={onChange}
    loading={loading}
    renderInput={params => (
      <TextField
        {...params}
        label="Select Services"
        size="small"
        InputProps={{
          ...params.InputProps,
          endAdornment: (
            <>
              {loading && <CircularProgress size={16} />}
              {params.InputProps.endAdornment}
            </>
          )
        }}
      />
    )}
  />
));
ServiceSelector.displayName = 'ServiceSelector';

const ServicePriceItem = ({
  service,
  index,
  control,
  onPriceChange
}: {
  service: BookingService;
  index: number;
  control: any;
  onPriceChange: (serviceId: number, price: number) => void;
}) => {
  const basePrice = service.basePrice || 0;
  const price = service.price || 0;
  const discountPercent = basePrice > 0 && price < basePrice
    ? ((basePrice - price) / basePrice) * 100
    : 0;

  return (
    <ListItem key={service.serviceId} divider sx={{ alignItems: 'center' }}>
      <ListItemText
        primary={service.name}
        secondary={
          <>
            Base: €{basePrice.toFixed(2)} • Charged: €{price.toFixed(2)}
            {discountPercent > 0 && (
              <Typography
                component="span"
                variant="caption"
                sx={{ ml: 1, color: '#4caf50' }}
              >
                {discountPercent.toFixed(0)}% off
              </Typography>
            )}
          </>
        }
      />
      <Controller
        name={`services.${index}.price`}
        control={control}
        defaultValue={price}
        render={({ field }) => (
          <TextField
            {...field}
            value={Number(field.value)}
            onChange={(e) => {
              const newPrice = Number(e.target.value);
              field.onChange(newPrice);
              onPriceChange(service.serviceId, newPrice);
            }}
            type="number"
            size="small"
            sx={{
              width: 100,
              ml: 2,
              '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
              },
              '& input[type=number]': { MozAppearance: 'textfield' },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">€</InputAdornment>
              ),
            }}
          />
        )}
      />
    </ListItem>
  );
};

// Main component
export const CreateBookingModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}> = ({ open, onClose, onCreated }) => {
  // Form setup
  const { control, handleSubmit, reset } = useForm<CreateBookingForm>({
    defaultValues: { customerId: '', licensePlate: '', pickupDate: '', workers: [], services: [] }
  });
  const { replace } = useFieldArray({ control, name: 'services' });

  // Customer state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Workers state
  const [workerOptions, setWorkerOptions] = useState<Worker[]>([]);

  // Services state
  const [serviceOptions, setServiceOptions] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [modifiedPrices, setModifiedPrices] = useState<Record<number, number>>({});

  // Fetch workers and services when the modal opens
  useEffect(() => {
    if (open) { // Only fetch when the modal is open
      // Fetch workers
      get<Worker[]>('/worker/', undefined, { disableToast: true })
        .then(response => {
          if (response.status === 'success') {
            // Filter workers to only those with status 'active' or 'password-reset'
            const activeWorkers = response.data?.filter(
              (worker) =>
                worker.status === 'active' ||
                worker.status === 'password-reset',
            );
            setWorkerOptions(activeWorkers || []);
          }
        })
        .catch(console.error);

      // Fetch services
      setIsLoadingServices(true);
      get<Service[]>('/services', undefined, { disableToast: true })
        .then(response => {
          if (response.status === 'success') {
            setServiceOptions(response.data || []);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingServices(false));
    }
  }, [open]);


  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      reset();
      setSelectedCustomer(null);
      setSelectedServices([]);
      setModifiedPrices({});
    }
  }, [open, reset]);

  // Customer search function
  const fetchCustomers = useCallback(async (search: string) => {
    const params = new URLSearchParams({
      page: '1',
      limit: '10',
      ...(search && { search }),
    });
    const response = await get<CustomersResponse>(
      `/customer/?${params.toString()}`,
      undefined,
      { disableToast: true }
    );
    return response.status === 'success' && response.data ? response.data.data : [];
  }, []);

  // Handle service selection changes
  const handleServicesChange = useCallback((_: any, newSelectedServices: Service[]) => {
    setSelectedServices(newSelectedServices);

    const updatedServices = newSelectedServices.map(service => {
      const serviceId = Number(service.id);
      return {
        serviceId,
        name: service.name,
        basePrice: +service.price,
        price: serviceId in modifiedPrices ? modifiedPrices[serviceId] : +service.price
      };
    });

    replace(updatedServices);
  }, [modifiedPrices, replace]);

  // Handle service price changes
  const handlePriceChange = useCallback((serviceId: number, newPrice: number) => {
    setModifiedPrices(prev => ({
      ...prev,
      [serviceId]: newPrice
    }));
  }, []);

  // Calculate totals
  const watchedServices = useWatch({ control, name: 'services' }) || [];
  const baseTotal = useMemo(
    () => watchedServices.reduce((sum, service) => sum + service.basePrice, 0),
    [watchedServices]
  );
  const total = useMemo(
    () => watchedServices.reduce((sum, service) => sum + service.price, 0),
    [watchedServices]
  );
  const discountPercent = baseTotal > 0 ? ((baseTotal - total) / baseTotal) * 100 : 0;

  // Form submission
  const handleFormSubmit = async (data: CreateBookingForm) => {
    const payload = {
      customerId: data.customerId,
      licensePlate: data.licensePlate,
      pickupDate: data.pickupDate,
      workers: data.workers.map((w) => ({ workerId: w.workerId })),
      services: data.services.map((s) => ({
        serviceId: s.serviceId,
        price: s.price,
      })),
    };
    
    const response = await post('/bookings', payload);
    if (response.status === 'success') {
      onCreated();
      onClose();
      reset();
    }
  };

  // Handle modal close
  const handleClose = () => {
    onClose();
    reset();
  };

  return (
    <Modal open={open} onClose={handleClose} closeAfterTransition>
      <Fade in={open}>
        <Box sx={modalStyle}>
          <Typography variant="h6">Create Booking</Typography>

          {/* Customer */}
          <Controller
            name="customerId"
            control={control}
            rules={{ required: 'Customer required' }}
            render={({ field: { onChange }, fieldState }) => (
              <SearchDropdown<Customer>
                value={selectedCustomer}
                onChange={customer => {
                  setSelectedCustomer(customer);
                  onChange(customer?.id || '');
                }}
                fetchOptions={fetchCustomers}
                getOptionLabel={customer => customer.name}
                renderOption={customer => (
                  <Stack direction="column" spacing={0.5} alignItems="left">
                    <Typography>{customer.name}</Typography>
                    <Stack direction="row" alignItems="left">
                      <LocalPhoneRoundedIcon fontSize="small" sx={{ color: 'gray', mr: 0.5 }} />
                      <Typography fontSize="small" variant="caption" color="gray">
                        {customer.phone}
                      </Typography>
                    </Stack>
                  </Stack>
                )}
                label="Search Customer"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          {/* License Plate */}
          <Controller
            name="licensePlate"
            control={control}
            rules={{ required: 'Required' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="License Plate"
                size="small"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          {/* Pickup Date */}
          <Controller
            name="pickupDate"
            control={control}
            rules={{ required: 'Required' }}
            render={({ field, fieldState }) => (
              <DatePicker
                label="Pickup At"
                showTime
                value={field.value}
                onChange={(val) => field.onChange(val)}
                error={fieldState.error}
              />
            )}
          />

          {/* Workers */}
          <Controller
            name="workers"
            control={control}
            rules={{ validate: v => v.length > 0 || 'Pick ≥1 worker' }}
            render={({ field: { value, onChange }, fieldState }) => {
              const selectedWorkers = workerOptions.filter(
                worker => value.some(v => v.workerId === worker.user.id)
              );
              
              return (
                <Autocomplete<Worker, true, false, false>
                  multiple
                  options={workerOptions}
                  getOptionLabel={worker => worker.user.name}
                  value={selectedWorkers}
                  onChange={(_, newSelectedWorkers) => 
                    onChange(newSelectedWorkers.map(worker => ({ workerId: worker.user.id })))
                  }
                  renderInput={params => (
                    <TextField
                      {...params}
                      label="Assign Workers"
                      size="small"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              );
            }}
          />

          {/* Services */}
          <ServiceSelector
            options={serviceOptions}
            loading={isLoadingServices}
            selected={selectedServices}
            onChange={handleServicesChange}
          />

          {/* Service Prices */}
          <List dense sx={{ maxHeight: 200, overflowY: 'auto' }}>
            {watchedServices.map((service, index) => (
              <ServicePriceItem
                key={service.serviceId}
                service={service}
                index={index}
                control={control}
                onPriceChange={handlePriceChange}
              />
            ))}
          </List>

          {/* Total */}
          <Typography variant="h6">
            Total: €{total.toFixed(2)}
            {discountPercent > 0 && (
              <Typography
                component="span"
                variant="subtitle2"
                sx={{ ml: 2, color: '#4caf50' }}
              >
                Discount of {discountPercent.toFixed(0)}%
              </Typography>
            )}
          </Typography>

          {/* Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <CustomButton customVariant="secondary" onClick={handleClose}>
              Cancel
            </CustomButton>
            <CustomButton onClick={handleSubmit(handleFormSubmit)}>
              Create Booking
            </CustomButton>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};
