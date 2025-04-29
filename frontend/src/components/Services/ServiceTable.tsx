import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Fade,
  Box,
  Typography,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { Service } from '../../types/serviceTypes';
import { CustomButton } from '../CustomButton'; // Import CustomButton

interface ServiceTableProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (id: string, name: string) => void; // Updated to accept name
  onCreateClick: () => void;
}

export const ServiceTable = ({
  services,
  onEdit,
  onDelete,
  onCreateClick,
}: ServiceTableProps) => (
  <Fade in={true}>
    <Table
      sx={{
        backgroundColor: '#1E1E1E',
        borderRadius: '12px',
        '& th, & td': { borderColor: '#2A2A2A' },
      }}
    >
      <TableHead>
        <TableRow>
          {['Name', 'Price (€)', 'Estimated Time (min)', 'Actions'].map((header) => (
            <TableCell
              key={header}
              sx={{ color: '#78909C', fontSize: '0.875rem', fontWeight: 600, py: 1.5 }}
            >
              {header}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {services.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} align="center">
              <Fade in>
                <Box sx={{ py: 4, color: '#A8C7E2' }}>
                  <Typography variant="h6">No services found</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Get started by adding a new service.
                  </Typography>
                  <CustomButton
                    startIcon={<Add />}
                    onClick={onCreateClick}
                    sx={{ borderRadius: '20px' }}
                  >
                    Create Service
                  </CustomButton>
                </Box>
              </Fade>
            </TableCell>
          </TableRow>
        ) : (
          services.map((service, index) => (
            <TableRow
              key={service.id}
              sx={{
                backgroundColor: index % 2 === 0 ? '#1E1E1E' : '#202020',
                '&:hover': { backgroundColor: 'rgba(74, 144, 226, 0.1)' },
                transition: 'background-color 0.2s',
              }}
            >
              <TableCell sx={{ color: '#E8ECEF', fontSize: '0.875rem', py: 1 }}>
                <Chip
                  label={service.name}
                  sx={{ bgcolor: '#4A90E2', color: '#E3F2FD', fontWeight: 'medium' }}
                />
              </TableCell>
              <TableCell sx={{ color: '#E8ECEF', fontSize: '0.875rem', py: 1 }}>
                <Chip
                  label={`€${service.price}`}
                  sx={{ bgcolor: '#388E3C', color: '#E3F2FD', fontWeight: 'medium' }}
                />
              </TableCell>
              <TableCell sx={{ color: '#E8ECEF', fontSize: '0.875rem', py: 1 }}>
                <Chip
                  label={`${service.estimated_time_minutes} min`}
                  sx={{ bgcolor: '#FBC02D', color: '#121212', fontWeight: 'medium' }}
                />
              </TableCell>
<TableCell>
  <IconButton
    onClick={() => onEdit(service)}
    sx={{ color: '#4A90E2', mr: 1 }}
  >
    <Edit />
  </IconButton>
  <IconButton
    onClick={() => onDelete(service.id, service.name)} // Pass both id and name
    sx={{ color: '#D32F2F' }}
  >
    <Delete />
  </IconButton>
</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </Fade>
);