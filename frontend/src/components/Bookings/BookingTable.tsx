// src/components/Bookings/BookingTable.tsx
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
} from '@mui/material';
import { Booking } from '../../types/bookingTypes';
import { Meta } from '../../types/index';
import { post } from '../../services/api';
import { toast } from 'react-toastify';
import BookingRow from './BookingRow';
import { PromptModal } from '../PromptModal';

interface BookingTableProps {
  bookings: Booking[];
  meta: Meta;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
}

const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  meta,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteBooking, setDeleteBooking] = useState<{ id: string; customerName: string } | null>(null);

  const handleDelete = (id: string, customerName: string) => {
    setDeleteBooking({ id, customerName });
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteBooking) return;
    try {
      await post<unknown>(`/bookings/${deleteBooking.id}`, null, { method: 'DELETE' });
      toast.success('Booking deleted successfully');
      onPageChange(meta.page); // Refresh the current page
    } catch (error) {
      toast.error('Failed to delete booking');
    } finally {
      setDeleteBooking(null);
      setOpenDeleteModal(false);
    }
  };

  // Table headers with unique keys
  const tableHeaders = [
    { id: 'expand', label: '', width: '50px' },
    { id: 'customer', label: 'Customer' },
    { id: 'pickup', label: 'Pickup At' },
    { id: 'price', label: 'Charged Price' },
    { id: 'license', label: 'License Plate' },
    { id: 'status', label: 'Status' },
    { id: 'actions', label: '', width: '50px' },
  ];

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
            {tableHeaders.map((header) => (
              <TableCell
                key={header.id}
                sx={{ 
                  color: '#78909C', 
                  fontSize: '0.875rem', 
                  fontWeight: 600, 
                  py: 1.5, 
                  width: header.width || 'auto' 
                }}
              >
                {header.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings.length > 0 ? (
            bookings.map((booking, index) => (
              <BookingRow
                key={booking.id || `booking-${index}`}
                booking={booking}
                index={index}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} sx={{ color: '#A8C7E2', py: 4, textAlign: 'center' }}>
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
