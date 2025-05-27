import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  alpha,
  Grid,
  Chip,
  Paper
} from '@mui/material';
import { useBookingDetails } from '../../hooks/useBookingDetails';
import { 
  calculateTotalPrice, 
  calculateTotalBasePrice, 
  calculateTotalServiceTime,
  calculateDiscountPercentage,
  formatPrice,
  formatBookingDate,
  formatBookingTime
} from '../../utils/bookingUtils';
import { BookingService } from '../../types/bookingTypes';
import { WorkerUser } from '../../types/workerTypes';

// Icons
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PhoneIcon from '@mui/icons-material/Phone';
import BuildIcon from '@mui/icons-material/Build';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EuroIcon from '@mui/icons-material/Euro';
import DiscountIcon from '@mui/icons-material/Discount';
import BadgeIcon from '@mui/icons-material/Badge';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

interface BookingDetailsPanelProps {
  bookingId: string;
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}

interface ServiceCardProps {
  service: BookingService & { service_name_at_booking: string };
}

interface WorkerCardProps {
  worker: WorkerUser;
}

// Info row component for consistent display of label-value pairs
const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value, valueColor = '#E8ECEF' }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
    {icon && (
      <Box sx={{ color: '#A8C7E2', mr: 1.5, display: 'flex', alignItems: 'center' }}>
        {icon}
      </Box>
    )}
    <Typography variant="body2" sx={{ color: '#A8C7E2', fontWeight: 500, width: '120px' }}>
      {label}:
    </Typography>
    <Typography variant="body2" sx={{ color: valueColor, fontWeight: 400, ml: 1 }}>
      {value || 'N/A'}
    </Typography>
  </Box>
);

// Service card component for displaying service details
const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => (
  <Paper 
    elevation={0}
    sx={{ 
      mb: 1.5, 
      p: 1.5, 
      bgcolor: alpha('#FFFFFF', 0.03), 
      borderRadius: '8px',
      border: '1px solid',
      borderColor: alpha('#FFFFFF', 0.08)
    }}
  >
    <Typography variant="subtitle2" sx={{ color: '#E8ECEF', mb: 1, fontWeight: 600 }}>
      {service.service_name_at_booking}
    </Typography>
    
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EuroIcon sx={{ fontSize: '0.9rem', color: '#A8C7E2', mr: 1 }} />
          <Typography variant="body2" sx={{ color: '#A8C7E2' }}>
            Price:
          </Typography>
          <Typography variant="body2" sx={{ ml: 1, fontWeight: 500, color: '#E8ECEF' }}>
            {formatPrice(parseFloat(service.charged_price))}
          </Typography>
        </Box>
      </Grid>
      
      <Grid item xs={6}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccessTimeIcon sx={{ fontSize: '0.9rem', color: '#A8C7E2', mr: 1 }} />
          <Typography variant="body2" sx={{ color: '#A8C7E2' }}>
            Time:
          </Typography>
          <Typography variant="body2" sx={{ ml: 1, fontWeight: 500, color: '#E8ECEF' }}>
            {service.time_estimate} min
          </Typography>
        </Box>
      </Grid>
      
      {parseFloat(service.base_price) > parseFloat(service.charged_price) && (
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DiscountIcon sx={{ fontSize: '0.9rem', color: '#4CAF50', mr: 1 }} />
            <Typography variant="body2" sx={{ color: '#4CAF50' }}>
              Discount:
            </Typography>
            <Typography variant="body2" sx={{ ml: 1, fontWeight: 500, color: '#4CAF50' }}>
              {formatPrice(parseFloat(service.base_price) - parseFloat(service.charged_price))} 
              ({(((parseFloat(service.base_price) - parseFloat(service.charged_price)) / parseFloat(service.base_price)) * 100).toFixed(0)}% off)
            </Typography>
          </Box>
        </Grid>
      )}
    </Grid>
  </Paper>
);

// Worker card component for displaying worker details
const WorkerCard: React.FC<WorkerCardProps> = ({ worker }) => (
  <Paper 
    elevation={0}
    sx={{ 
      mb: 1, 
      p: 1.5, 
      bgcolor: alpha('#FFFFFF', 0.03), 
      borderRadius: '8px',
      border: '1px solid',
      borderColor: alpha('#FFFFFF', 0.08)
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <BadgeIcon sx={{ color: '#A8C7E2', mr: 1.5 }} />
      <Typography variant="subtitle2" sx={{ color: '#E8ECEF', fontWeight: 600 }}>
        {worker.name}
      </Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, ml: 0.5 }}>
      <EmailIcon sx={{ fontSize: '0.9rem', color: '#A8C7E2', mr: 1 }} />
      <Typography variant="body2" sx={{ color: '#A8C7E2' }}>
        {worker.email}
      </Typography>
    </Box>
  </Paper>
);

const BookingDetailsPanel: React.FC<BookingDetailsPanelProps> = ({ bookingId }) => {
  const { details, loading, error } = useBookingDetails(bookingId);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !details) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error || 'No details available.'}</Typography>
      </Box>
    );
  }

  const totalCharged = calculateTotalPrice(details.bookingServices);
  const totalBase = calculateTotalBasePrice(details.bookingServices);
  const totalDiscount = totalBase - totalCharged;
  const totalEstimatedTime = calculateTotalServiceTime(details.bookingServices);

  return (
    <Box
      sx={{
        margin: 1,
        p: 3,
        bgcolor: alpha('#000000', 0.1),
        borderRadius: '8px',
      }}
    >
      {/* Header with booking ID and creation date */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{ color: '#E8ECEF', fontWeight: 600 }}
        >
          Booking Details
        </Typography>
        <Chip
          label={`ID: ${bookingId.substring(0, 8)}...`}
          size="small"
          sx={{
            bgcolor: alpha('#FFFFFF', 0.05),
            color: '#A8C7E2',
            '& .MuiChip-label': { px: 1 },
          }}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Customer & Booking Info */}
        <Grid item xs={12} md={6}>
          {/* Booking Info Section */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{
                color: '#A8C7E2',
                fontWeight: 600,
                mb: 1.5,
                display: 'flex',
                alignItems: 'center',
                '&::after': {
                  content: '""',
                  display: 'block',
                  height: '1px',
                  bgcolor: alpha('#A8C7E2', 0.2),
                  flexGrow: 1,
                  ml: 1.5,
                },
              }}
            >
              Booking Information
            </Typography>

            <InfoRow
              icon={<CalendarTodayIcon sx={{ fontSize: '1.1rem' }} />}
              label="Created At"
              value={`${formatBookingDate(details.created_at)} ${formatBookingTime(details.created_at)}`}
            />

            <InfoRow
              icon={<CalendarTodayIcon sx={{ fontSize: '1.1rem' }} />}
              label="Pickup At"
              value={`${formatBookingDate(details.pickup_at)} ${formatBookingTime(details.pickup_at)}`}
            />

            <InfoRow
              icon={<DirectionsCarIcon sx={{ fontSize: '1.1rem' }} />}
              label="License Plate"
              value={details.vehicle_license_plate}
            />

            <Box sx={{ mt: 2 }}>
              <Chip
                label={details.status}
                size="medium"
                sx={{
                  bgcolor:
                    details.status === 'Completed'
                      ? alpha('#4CAF50', 0.2)
                      : details.status === 'In Progress'
                        ? alpha('#2196F3', 0.2)
                        : details.status === 'Cancelled'
                          ? alpha('#F44336', 0.2)
                          : alpha('#aa974f', 0.18),
                  color:
                    details.status === 'Completed'
                      ? '#4CAF50'
                      : details.status === 'In Progress'
                        ? '#2196F3'
                        : details.status === 'Cancelled'
                          ? '#F44336'
                          : '#faefa0',
                  fontWeight: 500,
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            </Box>
          </Box>

          {/* Customer Section */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{
                color: '#A8C7E2',
                fontWeight: 600,
                mb: 1.5,
                display: 'flex',
                alignItems: 'center',
                '&::after': {
                  content: '""',
                  display: 'block',
                  height: '1px',
                  bgcolor: alpha('#A8C7E2', 0.2),
                  flexGrow: 1,
                  ml: 1.5,
                },
              }}
            >
              Customer
            </Typography>

            {details.customer ? (
              <>
                <InfoRow
                  icon={<PersonOutlineIcon sx={{ fontSize: '1.1rem' }} />}
                  label="Name"
                  value={details.customer.name}
                />

                <InfoRow
                  icon={<PhoneIcon sx={{ fontSize: '1.1rem' }} />}
                  label="Phone"
                  value={details.customer.phone || 'N/A'}
                />
              </>
            ) : (
              <Typography
                variant="body2"
                sx={{ color: '#E8ECEF', fontStyle: 'italic' }}
              >
                Customer data not available.
              </Typography>
            )}
          </Box>

                    {/* Workers Section */}
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                color: '#A8C7E2',
                fontWeight: 600,
                mb: 1.5,
                display: 'flex',
                alignItems: 'center',
                '&::after': {
                  content: '""',
                  display: 'block',
                  height: '1px',
                  bgcolor: alpha('#A8C7E2', 0.2),
                  flexGrow: 1,
                  ml: 1.5,
                },
              }}
            >
              Assigned Workers
            </Typography>

            {details.bookingWorkers && details.bookingWorkers.length > 0 ? (
              details.bookingWorkers.map((bw, index) => {
                if (bw && bw.worker) {
                  return (
                    <WorkerCard
                      key={`worker-${bw.worker.id}-${index}`}
                      worker={bw.worker}
                    />
                  );
                }
                return (
                  <Typography
                    key={`worker-error-${index}`}
                    variant="body2"
                    sx={{ color: '#E8ECEF', fontStyle: 'italic' }}
                  >
                    Worker data incomplete.
                  </Typography>
                );
              })
            ) : (
              <Typography
                variant="body2"
                sx={{ color: '#E8ECEF', fontStyle: 'italic' }}
              >
                No workers assigned.
              </Typography>
            )}
          </Box>

        </Grid>

        {/* Right Column - Services & Workers */}
        <Grid item xs={12} md={6}>
          {/* Services Section */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{
                color: '#A8C7E2',
                fontWeight: 600,
                mb: 1.5,
                display: 'flex',
                alignItems: 'center',
                '&::after': {
                  content: '""',
                  display: 'block',
                  height: '1px',
                  bgcolor: alpha('#A8C7E2', 0.2),
                  flexGrow: 1,
                  ml: 1.5,
                },
              }}
            >
              <BuildIcon sx={{ mr: 1, fontSize: '1.1rem' }} />
              Services
            </Typography>

            {details.bookingServices && details.bookingServices.length > 0 ? (
              <>
                {details.bookingServices.map((service) => (
                  <ServiceCard
                    key={service.id || `service-${Math.random()}`}
                    service={service}
                  />
                ))}

                <Paper
                  elevation={0}
                  sx={{
                    mt: 2,
                    p: 1.5,
                    bgcolor: alpha('#FFFFFF', 0.05),
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: alpha('#FFFFFF', 0.1),
                  }}
                >
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon
                          sx={{ fontSize: '0.9rem', color: '#A8C7E2', mr: 1 }}
                        />
                        <Typography variant="body2" sx={{ color: '#A8C7E2' }}>
                          Total Time:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ ml: 1, fontWeight: 600, color: '#E8ECEF' }}
                        >
                          {totalEstimatedTime} min
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EuroIcon
                          sx={{ fontSize: '0.9rem', color: '#A8C7E2', mr: 1 }}
                        />
                        <Typography variant="body2" sx={{ color: '#A8C7E2' }}>
                          Total:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ ml: 1, fontWeight: 600, color: '#E8ECEF' }}
                        >
                          {formatPrice(totalCharged)}
                        </Typography>
                      </Box>
                    </Grid>

                    {totalDiscount > 0 && (
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <DiscountIcon
                            sx={{ fontSize: '0.9rem', color: '#4CAF50', mr: 1 }}
                          />
                          <Typography variant="body2" sx={{ color: '#4CAF50' }}>
                            Discount:
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ ml: 1, fontWeight: 600, color: '#4CAF50' }}
                          >
                            {formatPrice(totalDiscount)} (
                            {calculateDiscountPercentage(
                              totalBase,
                              totalCharged,
                            ).toFixed(0)}
                            % off)
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </>
            ) : (
              <Typography
                variant="body2"
                sx={{ color: '#E8ECEF', fontStyle: 'italic' }}
              >
                No services for this booking.
              </Typography>
            )}
          </Box>

        </Grid>
      </Grid>
    </Box>
  );
};

export default React.memo(BookingDetailsPanel);
