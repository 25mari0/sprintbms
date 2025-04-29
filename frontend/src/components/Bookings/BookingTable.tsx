import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
} from '@mui/material';
import { Booking } from '../../types/bookingTypes';
import { Meta } from '../../types/index';
import { post } from '../../services/api';
import { toast } from 'react-toastify';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { useState } from 'react';
import { PromptModal } from '../PromptModal'; // Import PromptModal

interface BookingTableProps {
  bookings: Booking[];
  meta: Meta;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
}

const BookingTable = ({
  bookings,
  meta,
  onPageChange,
  onRowsPerPageChange,
}: BookingTableProps) => {
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteBooking, setDeleteBooking] = useState<{
    id: string;
    customerName: string;
  } | null>(null);

  const handleDelete = (id: string, customerName: string) => {
    setDeleteBooking({ id, customerName });
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteBooking) return;
    try {
      await post<unknown>(`/bookings/${deleteBooking.id}`, null, { method: 'DELETE' });
      toast.success('Booking deleted successfully');
      onPageChange(meta.page); // Trigger a re-fetch
    } catch (error) {
      toast.error('Failed to delete booking');
    } finally {
      setDeleteBooking(null);
      setOpenDeleteModal(false);
    }
  };

  const calculateTotalChargedPrice = (bookingServices: any[]) => {
    return bookingServices.reduce((total, service) => total + Number(service.charged_price), 0);
  };

  return (
    <div>
      <Table
        sx={{
          backgroundColor: '#1E1E1E',
          borderRadius: '12px',
          '& th, & td': { borderColor: '#2A2A2A' },
        }}
      >
        <TableHead>
          <TableRow>
            {['Customer', 'Pickup At', 'Charged Price', 'License Plate', 'Status', ''].map(
              (header) => (
                <TableCell
                  key={header}
                  sx={{ color: '#78909C', fontSize: '0.875rem', fontWeight: 600, py: 1.5 }}
                >
                  {header}
                </TableCell>
              )
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings.length > 0 ? (
            bookings.map((booking, index) => (
              <TableRow
                key={booking.id}
                sx={{
                  backgroundColor: index % 2 === 0 ? '#1E1E1E' : '#202020',
                  '&:hover': { backgroundColor: 'rgba(74, 144, 226, 0.1)' },
                  transition: 'background-color 0.2s',
                }}
              >
                <TableCell sx={{ color: '#E8ECEF', fontSize: '0.875rem', py: 1 }}>
                  {booking.customer.name}
                </TableCell>
                <TableCell sx={{ color: '#E8ECEF', fontSize: '0.875rem', py: 1 }}>
                  {new Date(booking.pickup_at).toLocaleString()}
                </TableCell>
                <TableCell sx={{ color: '#E8ECEF', fontSize: '0.875rem', py: 1 }}>
                  {'€' + calculateTotalChargedPrice(booking.bookingServices).toFixed(2)}
                </TableCell>
                <TableCell sx={{ color: '#E8ECEF', fontSize: '0.875rem', py: 1 }}>
                  {booking.vehicle_license_plate}
                </TableCell>
                <TableCell sx={{ color: '#E8ECEF', fontSize: '0.875rem', py: 1 }}>
                  {booking.status}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleDelete(booking.id, booking.customer.name)}
                    sx={{ color: '#D32F2F' }}
                  >
                    <DeleteOutlineRoundedIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} sx={{ color: '#A8C7E2', py: 4, textAlign: 'center' }}>
                No bookings available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={meta.total}
        page={meta.page - 1}
        onPageChange={(_, newPage) => onPageChange(newPage + 1)}
        rowsPerPage={meta.limit}
        onRowsPerPageChange={(event) => onRowsPerPageChange(parseInt(event.target.value, 10))}
        rowsPerPageOptions={[10, 20, 50]}
        sx={{
          color: '#A8C7E2',
          '& .MuiIconButton-root': { color: '#A8C7E2' },
          '& .MuiTablePagination-select': { color: '#E3F2FD' },
        }}
      />
      <PromptModal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setDeleteBooking(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={
          <span>
            Are you sure you want to delete the booking for{' '}
            <strong style={{ color: '#D81B60' }}>{deleteBooking?.customerName || ''}</strong>? This
            action cannot be undone.
          </span>
        }
        cancelLabel="Cancel"
        confirmLabel="Delete"
        confirmColor="#D81B60"
      />
    </div>
  );
};

export default BookingTable;