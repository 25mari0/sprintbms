import React, { useState } from 'react';
import {
  TableRow,
  TableCell,
  IconButton,
  Collapse
} from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { Booking } from '../../types/bookingTypes';
import { calculateTotalServiceTime, calculateTotalPrice } from '../../utils/bookingUtils';
import BookingStatusBadge from './BookingStatusBadge';
import LicensePlateDisplay from './LicensePlateDisplay';
import PickupTimeDisplay from './PickupTimeDisplay';
import BookingDetailsPanel from './BookingDetailsPanel';

interface BookingRowProps {
  booking: Booking;
  index: number;
  onDelete: (id: string, customerName: string) => void;
}

const BookingRow = ({ booking, index, onDelete }: BookingRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const totalServiceTime = calculateTotalServiceTime(booking.bookingServices);
  const totalPrice = calculateTotalPrice(booking.bookingServices);
  
  const handleExpandClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <React.Fragment>
      <TableRow
        sx={{
          backgroundColor: index % 2 === 0 ? '#1E1E1E' : '#202020',
          '&:hover': { backgroundColor: 'rgba(74, 144, 226, 0.1)' },
          transition: 'background-color 0.2s',
          '& > *': { borderBottom: isExpanded ? 'none' : undefined },
        }}
      >
        {/* Expand/Collapse Cell */}
        <TableCell padding="checkbox">
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={handleExpandClick}
            sx={{ color: '#A8C7E2' }}
          >
            {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowRightIcon />}
          </IconButton>
        </TableCell>

        {/* Customer Name Cell */}
        <TableCell sx={{ color: '#E8ECEF', fontSize: '0.875rem', py: 1 }}>
          {booking.customer.name}
        </TableCell>

        {/* Pickup Time Cell */}
        <TableCell sx={{ py: 1 }}>
          <PickupTimeDisplay 
            pickupAt={booking.pickup_at} 
            totalServiceTime={totalServiceTime} 
          />
        </TableCell>

        {/* Price Cell */}
        <TableCell sx={{ color: '#E8ECEF', fontSize: '0.875rem', fontWeight: 500, py: 1 }}>
          €{totalPrice.toFixed(2)}
        </TableCell>

        {/* License Plate Cell */}
        <TableCell sx={{ py: 1 }}>
          <LicensePlateDisplay licensePlate={booking.vehicle_license_plate} />
        </TableCell>

        {/* Status Cell */}
        <TableCell sx={{ py: 1 }}>
          <BookingStatusBadge status={booking.status} />
        </TableCell>

        {/* Actions Cell */}
        <TableCell>
          <IconButton
            onClick={() => onDelete(booking.id, booking.customer.name)}
            sx={{ color: '#D32F2F' }}
          >
            <DeleteOutlineRoundedIcon />
          </IconButton>
        </TableCell>
      </TableRow>

      {/* Collapsible Details Row */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <BookingDetailsPanel bookingId={booking.id} />
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

export default React.memo(BookingRow);
