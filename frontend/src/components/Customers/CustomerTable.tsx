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
      <Table
        sx={{
          backgroundColor: '#1E1E1E',
          borderRadius: '12px',
          '& th, & td': { borderColor: '#2A2A2A' },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: '#78909C', fontSize: '0.875rem', fontWeight: 600, py: 1.5 }}>Name</TableCell>
            <TableCell sx={{ color: '#78909C', fontSize: '0.875rem', fontWeight: 600, py: 1.5 }}>Phone</TableCell>
            <TableCell sx={{ color: '#78909C', fontSize: '0.875rem', fontWeight: 600, py: 1.5 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {customers.length > 0 ? (
            customers.map((customer, index) => (
              <TableRow
                key={customer.id}
                sx={{
                  backgroundColor: index % 2 === 0 ? '#1E1E1E' : '#202020',
                  '&:hover': { backgroundColor: 'rgba(74, 144, 226, 0.1)' },
                  transition: 'background-color 0.2s',
                  py: 1,
                }}
              >
                <TableCell sx={{ color: '#E8ECEF', fontSize: '0.875rem', py: 1 }}>{customer.name}</TableCell>
                <TableCell sx={{ color: '#E8ECEF', fontSize: '0.875rem', py: 1 }}>{customer.phone}</TableCell>
                <TableCell sx={{ py: 1 }}>
                  <IconButton
                    onClick={() => onEdit(customer)}
                    sx={{
                      color: '#4A90E2',
                      fontSize: '0.875rem',
                      '&:hover': { color: '#2196F3' },
                    }}
                    aria-label="Edit customer"
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => onDelete(customer.id)}
                    sx={{
                      color: '#D81B60',
                      fontSize: '0.875rem',
                      '&:hover': { color: '#C2185B' },
                    }}
                    aria-label="Delete customer"
                  >
                    <DeleteOutlineRounded fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} sx={{ color: '#78909C', fontSize: '0.875rem', textAlign: 'center', py: 2 }}>
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
        sx={{
          color: '#78909C',
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.875rem' },
          '& .MuiTablePagination-actions button': { color: '#78909C', '&:hover': { color: '#4A90E2' } },
        }}
      />
    </div>
  );
};

export default CustomerTable;