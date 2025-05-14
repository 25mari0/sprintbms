// src/components/Bookings/CreateBookingModal.tsx
import React, {
    useEffect,
    useState,
    useMemo,
    useCallback,
    memo,
  } from 'react';
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
  } from '@mui/material';
  import Autocomplete from '@mui/material/Autocomplete';
  import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form';
  import { debounce } from 'lodash';
  import { get, post } from '../../services/api';
  import { Service } from '../../types/serviceTypes';
  import { Customer, CustomersResponse } from '../../types/customerTypes';
  import { Worker } from '../../types/workerTypes'; 
  import { CustomButton } from '../CustomButton';
import DatePicker from '../DatePicker';
  
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

  interface CreateBookingForm {
    customerId: string;
    licensePlate: string;
    pickupDate: string;
    workers: { workerId: string }[];
    services: { serviceId: number; name: string; basePrice: number; price: number }[];
  }
  
  // A tiny memo’d dropdown so it never re-renders on price edit:
  const ServiceSelector = memo(({
    svcOptions,
    svcLoading,
    selected,
    onChange
  }: {
    svcOptions: Service[];
    svcLoading: boolean;
    selected: Service[];
    onChange: (e:any, v:Service[])=>void;
  }) => (
    <Autocomplete<Service, true, false, false>
      multiple
      options={svcOptions}
      getOptionLabel={s => s.name}
      value={selected}
      onChange={onChange}
      loading={svcLoading}
      renderInput={params => (
        <TextField
          {...params}
          label="Select Services"
          size="small"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {svcLoading && <CircularProgress size={16}/> }
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
    />
  ));
  ServiceSelector.displayName = 'ServiceSelector';
  
  export const CreateBookingModal: React.FC<{
    open: boolean;
    onClose: ()=>void;
    onCreated: ()=>void;
  }> = ({ open, onClose, onCreated }) => {
    const { control, handleSubmit, reset } = useForm<CreateBookingForm>({
      defaultValues: { customerId:'', licensePlate:'', pickupDate:'', workers:[], services:[] }
    });
    const { fields, append, remove } = useFieldArray({ control, name:'services' });
  
    // Customer search
    const [custInput, setCustInput] = useState('');
    const [custOptions, setCustOptions] = useState<Customer[]>([]);
    const [custLoading, setCustLoading] = useState(false);
  
    // Workers & services
    const [workerOptions, setWorkerOptions] = useState<Worker[]>([]);
    const [svcOptions, setSvcOptions] = useState<Service[]>([]);
    const [svcLoading, setSvcLoading] = useState(false);
  
    // Dropdown state for services
    const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  
    // Fetch workers + services once
    useEffect(() => {
      get<Worker[]>('/worker/', undefined, { disableToast:true })
        .then(r => r.status==='success' && setWorkerOptions(r.data || []))
        .catch(console.error);
      setSvcLoading(true);
      get<Service[]>('/services', undefined, { disableToast:true })
        .then(r => r.status==='success' && setSvcOptions(r.data||[]))
        .catch(console.error)
        .finally(()=>setSvcLoading(false));
    }, []);
  
    // Debounced search
    const runSearch = useCallback(debounce((q:string)=>{
      setCustLoading(true);
      get<CustomersResponse>(`/customer/?search=${encodeURIComponent(q)}&limit=10`, undefined, {disableToast:true})
        .then(r=> {
          if(r.status==='success' && r.data) setCustOptions(r.data.data);
        })
        .finally(()=>setCustLoading(false));
    },300),[]);
  
    useEffect(()=>{
      if(custInput) runSearch(custInput);
      else setCustOptions([]);
    },[custInput, runSearch]);
  
    // Total & baseTotal
    const watchedServices = useWatch({ control, name: 'services' }) || [];
    const baseTotal = useMemo(
        () => watchedServices.reduce((sum, f) => sum + f.basePrice, 0),
        [watchedServices]
      );
      const total = useMemo(
        () => watchedServices.reduce((sum, f) => sum + f.price, 0),
        [watchedServices]
      );
      const totalPct = baseTotal > 0 ? ((baseTotal - total) / baseTotal) * 100 : 0;
  
    // Sync services
    const onServicesChange = (_:any, newSel:Service[])=>{
      setSelectedServices(newSel);
      const exist = new Set(fields.map(f=>f.serviceId));
      newSel.forEach(s=>{
        if(!exist.has(Number(s.id))){
          append({ serviceId: Number(s.id), name:s.name, basePrice:+s.price, price:+s.price });
        }
      });
      fields.forEach((f,i)=>{
        if(!newSel.find(s => Number(s.id) === f.serviceId)) remove(i);
      });
    };
  
    // Submit
    const onSubmit = async (data:CreateBookingForm)=>{
      const payload = {
        customerId: data.customerId,
        licensePlate: data.licensePlate,
        pickupDate: data.pickupDate,
        workers: data.workers.map(w=>({ workerId:w.workerId })),
        services: data.services.map(s=>({ serviceId:s.serviceId, price:s.price }))
      };
      const res = await post('/bookings', payload);
      if(res.status==='success'){ onCreated(); onClose(); reset(); }
    };
  
    return (
      <Modal open={open} onClose={onClose} closeAfterTransition>
        <Fade in={open}>
          <Box sx={modalStyle}>
            <Typography variant="h6">Create Booking</Typography>
  
            {/* Customer */}
            <Controller name="customerId" control={control}
              rules={{ required:'Customer required' }}
              render={({ field:{value,onChange}, fieldState })=>{
                const sel = custOptions.find(c=>c.id===value)||null;
                return (
                  <Autocomplete<Customer,false,false,false>
                    options={custOptions}
                    getOptionLabel={c=>c.name}
                    inputValue={custInput}
                    onInputChange={(_,v)=>setCustInput(v)}
                    filterOptions={opts=>opts}
                    isOptionEqualToValue={(o,v)=>o.id===v.id}
                    value={sel}
                    onChange={(_,v)=>onChange(v?.id||'')}
                    loading={custLoading}
                    renderOption={(props, opt) => {
                        // pull key out so we can pass it explicitly
                        const { key, ...rest } = props as any;
                        return (
                          <li key={key} {...rest}>
                            <Typography>{opt.name}</Typography>
                            <Typography variant="caption" color="gray">
                              {opt.phone}
                            </Typography>
                          </li>
                        );
                      }}
                    renderInput={params=>(
                      <TextField
                        {...params}
                        label="Search Customer"
                        size="small"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment:(
                            <>
                              {custLoading&&<CircularProgress size={16}/>}
                              {params.InputProps.endAdornment}
                            </>
                          )
                        }}
                      />
                    )}
                  />
                );
              }}
            />
  
            {/* License */}
            <Controller name="licensePlate" control={control}
              rules={{ required:'Required' }}
              render={({ field, fieldState })=>(
                <TextField
                  {...field}
                  label="License Plate"
                  size="small"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
  
            {/* Date */}
            <Controller
                name="pickupDate"
                control={control}
                rules={{ required: 'Required' }}
                render={({ field, fieldState }) => (
                <DatePicker
                label="Pickup At"
                showTime      // <-- now toggles date+time
                value={field.value}
                onChange={(val) => field.onChange(val)}
                error={fieldState.error}
                />
                )}
                />

  
            {/* Workers */}
            <Controller name="workers" control={control}
              rules={{ validate:v=>v.length>0||'Pick ≥1 worker' }}
              render={({ field:{value,onChange}, fieldState })=>{
                const sel = workerOptions.filter(w=>value.some(v=>v.workerId===w.user.id));
                return (
                  <Autocomplete<Worker,true,false,false>
                    multiple
                    options={workerOptions}
                    getOptionLabel={w=>w.user.name}
                    value={sel}
                    onChange={(_,v)=>onChange(v.map(w=>({workerId:w.user.id})))}
                    renderInput={params=>(
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
              svcOptions={svcOptions}
              svcLoading={svcLoading}
              selected={selectedServices}
              onChange={onServicesChange}
            />
  
            {/* Price + % */}
            <List dense sx={{ maxHeight: 200, overflowY: 'auto' }}>
                {watchedServices.map((f, idx) => {
                    const pct = f.price < f.basePrice
                    ? ((f.basePrice - f.price) / f.basePrice) * 100
                    : 0;

                    return (
                    <ListItem key={f.serviceId} divider sx={{ alignItems: 'center' }}>
                        <ListItemText
                        primary={f.name}
                        secondary={
                            <>
                            Base: €{f.basePrice.toFixed(2)} • Your: €{f.price.toFixed(2)}
                            {pct > 0 && (
                                <Typography
                                component="span"
                                variant="caption"
                                sx={{ ml: 1, color: '#4caf50' }}
                                >
                                {pct.toFixed(0)}% off
                                </Typography>
                            )}
                            </>
                        }
                        />

                        <Controller
                        name={`services.${idx}.price`}
                        control={control}
                        defaultValue={f.price}
                        render={({ field }) => (
                            <TextField
                            {...field}
                            value={Number(field.value)}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            type="number"
                            size="small"
                            sx={{
                                width: 100,
                                ml: 2,
                                // hide spinners
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
                })}
                </List>
  
            {/* Total + overall % */}
            <Typography variant="h6">
            Total: €{total.toFixed(2)}
            {totalPct > 0 && (
                <Typography
                component="span"
                variant="subtitle2"
                sx={{ ml: 2, color: '#4caf50' }}
                >
                You save {totalPct.toFixed(0)}%
                </Typography>
            )}
            </Typography>
  
            {/* Actions */}
            <Box sx={{ display:'flex', justifyContent:'flex-end', gap:1 }}>
              <CustomButton customVariant="secondary" onClick={()=>{onClose(); reset();}}>
                Cancel
              </CustomButton>
              <CustomButton onClick={handleSubmit(onSubmit)}>
                Create Booking
              </CustomButton>
            </Box>
          </Box>
        </Fade>
      </Modal>
    );
  };