import { useState, useEffect, SetStateAction } from 'react';
import { get } from '../services/api';
import { Booking, BookingsResponse } from '../types/bookingTypes';
import { Meta } from '../types/index';
import BookingTable from '../components/Bookings/BookingTable';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Search } from '@mui/icons-material';
import { CustomButton } from '../components/CustomButton';
import DropdownSelect from '../components/DropdownSelect';
import { TextBox } from '../components/TextBox'; 
import DatePicker from '../components/DatePicker'; 
const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [loading, setLoading] = useState(true);
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
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <DropdownSelect value={statusFilter} onChange={setStatusFilter} />
        <TextBox
          label="Search Filter"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e: { key: string; }) => e.key === 'Enter' && handleSearch()}
        />
        <CustomButton
          startIcon={<Search />}
          onClick={handleSearch}
        >
          Search
        </CustomButton>
        <DatePicker
          label="Pickup Date Start"
          value={pickupDateStart}
          onChange={(e: { target: { value: SetStateAction<string>; }; }) => setPickupDateStart(e.target.value)}
        />
        <DatePicker
          label="Pickup Date End"
          value={pickupDateEnd}
          onChange={(e: { target: { value: SetStateAction<string>; }; }) => setPickupDateEnd(e.target.value)}
        />
        <CustomButton
          customVariant="secondary"
          onClick={handleClearFilters}
        >
          Clear Filters
        </CustomButton>
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