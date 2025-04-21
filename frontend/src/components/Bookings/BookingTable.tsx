import { Table, TableBody, TableCell, TableHead, TableRow, TablePagination, IconButton } from '@mui/material';
import { Booking, Meta } from '../../types/bookingTypes';
import { post } from '../../services/api';
import { toast } from 'react-toastify';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

interface BookingTableProps {
  bookings: Booking[];
  meta: Meta;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
}

const BookingTable = ({ bookings, meta, onPageChange, onRowsPerPageChange }: BookingTableProps) => {

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {

      try {
        await post<unknown>(`/bookings/${id}`, null, { method: 'DELETE' });
        toast.success('Booking deleted successfully');
        onPageChange(meta.page); // Trigger a re-fetch
      } catch (error) {
        toast.error('Failed to delete booking');
      }
    }
  };
    
  const calculateTotalChargedPrice = (bookingServices: any[]) => {
    return bookingServices.reduce((total, service) => total + Number(service.charged_price), 0);
  };

  return (
    <div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Customer</TableCell>
            <TableCell>Pickup At</TableCell>
            <TableCell>Charged Price</TableCell>
            <TableCell>License Plate</TableCell>
            <TableCell>Status</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.customer.name}</TableCell>
                <TableCell>{new Date(booking.pickup_at).toLocaleString()}</TableCell>
                <TableCell>{'€' + calculateTotalChargedPrice(booking.bookingServices).toFixed(2)}</TableCell>
                <TableCell>{booking.vehicle_license_plate}</TableCell>
                <TableCell>{booking.status}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDelete(booking.id)} color="error">
                    <DeleteOutlineRoundedIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6}>No bookings available</TableCell>
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
      />
    </div>
  );
};

export default BookingTable;