// src/pages/BookingsPage.tsx
import { useState, useEffect } from 'react';
import { get } from '../services/api'; // Import post for delete
import { Booking, Meta, BookingsResponse } from '../types/bookingTypes';
import BookingTable from '../components/Bookings/BookingTable';
import { TextField, Button, MenuItem, Select, InputLabel, FormControl, Box } from '@mui/material';

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [customerNameFilter, setCustomerNameFilter] = useState<string>('');
  const [pickupDateStart, setPickupDateStart] = useState<string>('');
  const [pickupDateEnd, setPickupDateEnd] = useState<string>('');

  useEffect(() => {
    const loadBookings = async () => {
      try {
        // Build query parameters for filters
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: rowsPerPage.toString(),
          ...(statusFilter && { status: statusFilter }),
          ...(customerNameFilter && { customerName: customerNameFilter }),
          ...(pickupDateStart && { startDate: pickupDateStart }),
          ...(pickupDateEnd && { endDate: pickupDateEnd }),
        });

        const response = await get<BookingsResponse>(
          `/bookings?${queryParams.toString()}`,
          {},
          { disableToast: true }
        );
        console.log('API Response:', response);
        if (response.status === 'success') {
          console.log('Bookings data:', response.data);
          setBookings(response.data || []);
          console.log('Meta data:', response.meta);
          setMeta(response.meta || { total: 0, page: 1, limit: 20, totalPages: 1 });
        } else {
          setBookings([]);
          setMeta({ total: 0, page: 1, limit: 20, totalPages: 1 });
        }
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
        setBookings([]);
        setMeta({ total: 0, page: 1, limit: 20, totalPages: 1 });
      }
    };
    loadBookings();
  }, [page, rowsPerPage, statusFilter, customerNameFilter, pickupDateStart, pickupDateEnd]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setCustomerNameFilter('');
    setPickupDateStart('');
    setPickupDateEnd('');
    setPage(1);
  };



  return (
    <div>
      <h1>Bookings</h1>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as string)}
            label="Status"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
            {/* Add more statuses as needed */}
          </Select>
        </FormControl>
        <TextField
          label="Customer Name"
          value={customerNameFilter}
          onChange={(e) => setCustomerNameFilter(e.target.value)}
        />
        <TextField
          label="Pickup Date Start"
          type="date"
          value={pickupDateStart}
          onChange={(e) => setPickupDateStart(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Pickup Date End"
          type="date"
          value={pickupDateEnd}
          onChange={(e) => setPickupDateEnd(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="outlined" onClick={handleClearFilters}>
          Clear Filters
        </Button>
      </Box>
      <div>Debug: {bookings.length} bookings loaded</div>
      <BookingTable
        bookings={bookings}
        meta={meta}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </div>
  );
};

export default BookingsPage;