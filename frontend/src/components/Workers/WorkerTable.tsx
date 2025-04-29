import {
  Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Chip, Fade, Box, Typography
} from '@mui/material';
import { SortRounded as SortIcon, Add } from '@mui/icons-material';
import {
  BlockRounded as SuspendIcon, PlayCircleRounded as ReactivateIcon,
  VpnKeyRounded as ResetPasswordIcon, ReplayRounded as ResendResetIcon,
  VerifiedUserRounded as ResendVerificationIcon
} from '@mui/icons-material';
import { Worker } from '../../types/workerTypes';
import { CustomButton } from '../CustomButton'; // Import CustomButton
import { Button } from '@mui/material'; // Keep Button for action buttons

const statusConfig: Record<string, { text: string; color: string }> = {
  'password-reset': { text: 'Password Reset Pending', color: '#e29c4a' },
  unverified: { text: 'Account Verification Pending', color: '#4A90E2' },
  active: { text: 'Active', color: '#388E3C' },
  suspended: { text: 'Suspended', color: '#e2504a' },
};

type WorkerTableProps = {
  workers: Worker[];
  sort: { column: keyof Worker['user'] | 'status'; direction: 'asc' | 'desc' };
  onSort: (column: keyof Worker['user'] | 'status') => void;
  onCreateClick: () => void;
  onSuspend: (userId: string) => void;
  onReactivate: (userId: string) => void;
  onResetPassword: (userId: string) => void;
  onResendPasswordReset: (userId: string) => void;
  onResendVerification: (userId: string) => void;
};

export const WorkerTable = ({
  workers, sort, onSort, onCreateClick, onSuspend, onReactivate, onResetPassword,
  onResendPasswordReset, onResendVerification
}: WorkerTableProps) => {
  const getActionButtons = (worker: Worker) => {
    const buttons = [];
    const commonSx = { mr: 1, mb: 1, minWidth: '40px' };

    if (worker.status === 'active') {
      buttons.push(
        <Tooltip key="reset" title="Reset Worker Password">
          <Button variant="outlined" color="primary" size="small" onClick={() => onResetPassword(worker.user.id)} sx={commonSx}>
            <ResetPasswordIcon />
          </Button>
        </Tooltip>,
        <Tooltip key="suspend" title="Suspend Worker">
          <Button variant="outlined" color="warning" size="small" onClick={() => onSuspend(worker.user.id)} sx={commonSx}>
            <SuspendIcon />
          </Button>
        </Tooltip>
      );
    } else if (worker.status === 'suspended') {
      buttons.push(
        <Tooltip key="reactivate" title="Reactivate Worker">
          <Button variant="outlined" color="success" size="small" onClick={() => onReactivate(worker.user.id)} sx={commonSx}>
            <ReactivateIcon />
          </Button>
        </Tooltip>
      );
    } else if (worker.status === 'password-reset') {
      buttons.push(
        <Tooltip key="resend-reset" title="Resend Password Reset Email">
          <Button variant="outlined" color="info" size="small" onClick={() => onResendPasswordReset(worker.user.id)} sx={commonSx}>
            <ResendResetIcon />
          </Button>
        </Tooltip>,
        <Tooltip key="suspend" title="Suspend Worker">
          <Button variant="outlined" color="warning" size="small" onClick={() => onSuspend(worker.user.id)} sx={commonSx}>
            <SuspendIcon />
          </Button>
        </Tooltip>
      );
    } else if (worker.status === 'unverified') {
      buttons.push(
        <Tooltip key="resend-verification" title="Resend Verification Email">
          <Button variant="outlined" color="info" size="small" onClick={() => onResendVerification(worker.user.id)} sx={commonSx}>
            <ResendVerificationIcon />
          </Button>
        </Tooltip>,
        <Tooltip key="suspend" title="Suspend Worker">
          <Button variant="outlined" color="warning" size="small" onClick={() => onSuspend(worker.user.id)} sx={commonSx}>
            <SuspendIcon />
          </Button>
        </Tooltip>
      );
    }
    return buttons;
  };

  return (
    <Fade in={true}>
      <Table sx={{ backgroundColor: '#1E1E1E', borderRadius: '12px', '& th, & td': { borderColor: '#2A2A2A' } }}>
        <TableHead>
          <TableRow>
            {['name', 'email', 'status'].map((col) => (
              <TableCell
                key={col}
                sx={{ color: '#78909C', fontSize: '0.875rem', fontWeight: 600, py: 1.5, cursor: 'pointer' }}
                onClick={() => onSort(col as keyof Worker['user'] | 'status')}
              >
                {col.charAt(0).toUpperCase() + col.slice(1)}
                {sort.column === col && <SortIcon sx={{ fontSize: 16, verticalAlign: 'middle' }} />}
              </TableCell>
            ))}
            <TableCell sx={{ color: '#78909C', fontSize: '0.875rem', fontWeight: 600, py: 1.5 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {workers.length > 0 ? (
            workers.map((worker, index) => (
              <TableRow
                key={worker.user.id}
                sx={{
                  backgroundColor: index % 2 === 0 ? '#1E1E1E' : '#202020',
                  '&:hover': { backgroundColor: 'rgba(74, 144, 226, 0.1)' },
                  transition: 'background-color 0.2s',
                }}
              >
                <TableCell sx={{ color: '#E8ECEF', fontSize: '0.875rem', py: 1 }}>{worker.user.name}</TableCell>
                <TableCell sx={{ color: '#E8ECEF', fontSize: '0.875rem', py: 1 }}>{worker.user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={statusConfig[worker.status]?.text || worker.status}
                    sx={{
                      color: '#E8ECEF',
                      bgcolor: statusConfig[worker.status]?.color || '#3A3A3A',
                      fontWeight: '500',
                    }}
                    variant="filled"
                  />
                </TableCell>
                <TableCell>{getActionButtons(worker)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <Fade in>
                  <Box sx={{ py: 4, color: '#A8C7E2' }}>
                    <Typography variant="h6">No workers found</Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Get started by adding a new worker.
                    </Typography>
                    <CustomButton
                      startIcon={<Add />}
                      onClick={onCreateClick}
                      sx={{ borderRadius: '20px' }}
                    >
                      Create Worker
                    </CustomButton>
                  </Box>
                </Fade>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Fade>
  );
};