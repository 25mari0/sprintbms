import { Table, TableBody, TableCell, TableHead, TableRow, TablePagination, IconButton } from '@mui/material';
import { Edit, DeleteOutlineRounded } from '@mui/icons-material';
import { Customer } from '../../types/customerTypes';
import { Meta } from '../../types/index';

interface CustomerTableProps {
  customers: Customer[];
  meta: Meta;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

const CustomerTable = ({
  customers,
  meta,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
}: CustomerTableProps) => {
  return (
    <div>
      <Table sx={{ backgroundColor: '#1E1E1E', borderRadius: '8px' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: '#A8C7E2' }}>Name</TableCell>
            <TableCell sx={{ color: '#A8C7E2' }}>Phone</TableCell>
            <TableCell sx={{ color: '#A8C7E2' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {customers.length > 0 ? (
            customers.map((customer) => (
              <TableRow key={customer.id} sx={{ '&:hover': { backgroundColor: '#2A2A2A' } }}>
                <TableCell sx={{ color: '#E3F2FD' }}>{customer.name}</TableCell>
                <TableCell sx={{ color: '#E3F2FD' }}>{customer.phone}</TableCell>
                <TableCell>
                  <IconButton onClick={() => onEdit(customer)} sx={{ color: '#4A90E2' }} aria-label="Edit customer">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => onDelete(customer.id)} sx={{ color: '#D32F2F' }} aria-label="Delete customer">
                    <DeleteOutlineRounded />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} sx={{ color: '#A8C7E2', textAlign: 'center' }}>
                No customers available
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
        sx={{ color: '#A8C7E2' }}
      />
    </div>
  );
};

export default CustomerTable;