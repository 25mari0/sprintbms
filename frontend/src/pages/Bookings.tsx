import { useState, useEffect } from 'react';
import { get } from '../services/api';
import { Booking, BookingsResponse } from '../types/bookingTypes';
import { Meta } from '../types/index';
import BookingTable from '../components/Bookings/BookingTable';
import { TextField, Button, MenuItem, Select, InputLabel, FormControl, Box, CircularProgress, Typography } from '@mui/material';
import { Search } from '@mui/icons-material';

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [loading, setLoading] = useState(true);
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState<string>(''); 
  const [pickupDateStart, setPickupDateStart] = useState<string>('');
  const [pickupDateEnd, setPickupDateEnd] = useState<string>('');

  const loadBookings = async (
    targetPage: number,
    searchQuery: string = '',
    status: string = '',
    startDate: string = '',
    endDate: string = ''
  ) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: targetPage.toString(),
        limit: rowsPerPage.toString(),
        ...(status && { status }),
        ...(searchQuery && { bookingText: searchQuery }), 
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });

      const response = await get<BookingsResponse>(
        `/bookings?${queryParams.toString()}`,
        {},
        { disableToast: true }
      );
      if (response.status === 'success' && response.data) {
        setBookings(response.data.data || []);
        setMeta(response.data.meta || { total: 0, page: 1, limit: 20, totalPages: 1 });
      } else {
        setBookings([]);
        setMeta({ total: 0, page: 1, limit: 20, totalPages: 1 });
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
      setMeta({ total: 0, page: 1, limit: 20, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings(page, search, statusFilter, pickupDateStart, pickupDateEnd);
  }, [page, rowsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage === page) {
      loadBookings(newPage, search, statusFilter, pickupDateStart, pickupDateEnd);
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
    loadBookings(1, search, statusFilter, pickupDateStart, pickupDateEnd);
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setSearch(''); 
    setPickupDateStart('');
    setPickupDateEnd('');
    setPage(1);
    loadBookings(1); 
  };

  return (
    <Box sx={{ p: 4, minHeight: '100vh', bgcolor: '#121212', color: '#E3F2FD' }}>
      <Typography variant="h4" gutterBottom>
        Bookings
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel sx={{ color: '#A8C7E2' }}>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as string)}
            label="Status"
            sx={{ color: '#E3F2FD', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#3A3A3A' } }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ input: { color: '#E3F2FD' }, '& .MuiInputLabel-root': { color: '#A8C7E2' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#3A3A3A' } } }}
        />
        <Button
          variant="contained"
          startIcon={<Search />}
          onClick={handleSearch}
          sx={{ borderRadius: '20px' }}
        >
          Search
        </Button>
        <TextField
          label="Pickup Date Start"
          type="date"
          value={pickupDateStart}
          onChange={(e) => setPickupDateStart(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ input: { color: '#E3F2FD' }, '& .MuiInputLabel-root': { color: '#A8C7E2' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#3A3A3A' } } }}
        />
        <TextField
          label="Pickup Date End"
          type="date"
          value={pickupDateEnd}
          onChange={(e) => setPickupDateEnd(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ input: { color: '#E3F2FD' }, '& .MuiInputLabel-root': { color: '#A8C7E2' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#3A3A3A' } } }}
        />
        <Button variant="outlined" onClick={handleClearFilters} sx={{ color: '#A8C7E2', borderColor: '#3A3A3A' }}>
          Clear Filters
        </Button>
      </Box>
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
        <BookingTable
          bookings={bookings}
          meta={meta}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Box>
    </Box>
  );
};

export default BookingsPage;