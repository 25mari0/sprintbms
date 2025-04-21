import { Table, TableBody, TableCell, TableHead, TableRow, IconButton, Chip, Fade, Box, Typography, Button } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { Service } from '../../types/serviceTypes'; 

type ServiceTableProps = {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
};

export const ServiceTable = ({ services, onEdit, onDelete }: ServiceTableProps) => (
  <Fade in={true}>
    <Table sx={{ backgroundColor: '#1E1E1E', borderRadius: '8px' }}>
      <TableHead>
        <TableRow>
          {['Name', 'Price (€)', 'Estimated Time (min)', 'Actions'].map((header) => (
            <TableCell key={header} sx={{ color: '#E3F2FD' }}>{header}</TableCell>
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
                  <Button variant="contained" color="primary" sx={{ borderRadius: '20px' }}>
                    Create Service
                  </Button>
                </Box>
              </Fade>
            </TableCell>
          </TableRow>
        ) : (
          services.map((service) => (
            <TableRow key={service.id} sx={{ '&:hover': { backgroundColor: '#2A2A2A' } }}>
              <TableCell><Chip label={service.name} sx={{ bgcolor: '#4A90E2', color: '#E3F2FD', fontWeight: 'medium' }} /></TableCell>
              <TableCell><Chip label={`€${service.price}`} sx={{ bgcolor: '#388E3C', color: '#E3F2FD', fontWeight: 'medium' }} /></TableCell>
              <TableCell><Chip label={`${service.estimated_time_minutes} min`} sx={{ bgcolor: '#FBC02D', color: '#121212', fontWeight: 'medium' }} /></TableCell>
              <TableCell>
                <IconButton onClick={() => onEdit(service)} sx={{ color: '#4A90E2', mr: 1 }}><Edit /></IconButton>
                <IconButton onClick={() => onDelete(service.id)} sx={{ color: '#D32F2F' }}><Delete /></IconButton>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </Fade>
);