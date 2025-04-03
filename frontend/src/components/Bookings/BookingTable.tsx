import { Table, TableBody, TableCell, TableHead, TableRow, TablePagination } from '@mui/material';
import { Booking, Meta } from '../../types/bookingTypes';

interface BookingTableProps {
  bookings: Booking[];
  meta: Meta;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
}

const BookingTable = ({ bookings, meta, onPageChange, onRowsPerPageChange }: BookingTableProps) => {
  console.log('Bookings in table:', bookings); // Debug the bookings prop

  return (
    <div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Business</TableCell>
            <TableCell>Pickup At</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.id}</TableCell>
                <TableCell>{booking.customer.name}</TableCell>
                <TableCell>{booking.business.name}</TableCell>
                <TableCell>{booking.pickup_at}</TableCell>
                <TableCell>{booking.status}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5}>No bookings available</TableCell>
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