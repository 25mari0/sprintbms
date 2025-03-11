import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext'; // Rename to avoid conflict
import { useAuth } from '../hooks/useAuth'; // Import the hook
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress,
} from '@mui/material';

export function Dashboard() {
  const navigate = useNavigate();
  const { userData, loading } = useAuthContext(); // Use renamed context hook
  const { logout } = useAuth(); // Get logout from useAuth hook

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!userData) {
    return null; // AuthProvider will redirect
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="h6" gutterBottom>
        Welcome, {userData.email}!
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="User ID" secondary={userData.userId} />
        </ListItem>
        <ListItem>
          <ListItemText primary="Role" secondary={userData.role} />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Has Business"
            secondary={userData.hasBusiness ? 'Yes' : 'No'}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Premium Status"
            secondary={userData.isPremium ? 'Active' : 'Expired'}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="License Expiration"
            secondary={
              userData.licenseExpirationDate
                ? new Date(userData.licenseExpirationDate).toLocaleDateString()
                : 'N/A'
            }
          />
        </ListItem>
      </List>
      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/business/create?mode=renew')}
          sx={{ mr: 2 }}
        >
          Renew Subscription
        </Button>
        <Button
          variant="outlined"
          onClick={logout} 
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
}

export default Dashboard;