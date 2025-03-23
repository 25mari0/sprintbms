import { Box } from '@mui/material';
import { ReactNode } from 'react'; // Import ReactNode for typing children
import SidebarComponent from './Sidebar';

// Define an interface for the props
interface ProtectedLayoutProps {
  children: ReactNode; // Explicitly type the children prop
}

// Use the interface to type the component's props
const ProtectedLayout = ({ children }: ProtectedLayoutProps) => (
    <Box sx={{ display: 'flex' }}>
    <SidebarComponent />
    <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          minHeight: '100vh',
          borderRadius: '0px',
      }}
    >
      {children}
    </Box>
  </Box>
);

export default ProtectedLayout;