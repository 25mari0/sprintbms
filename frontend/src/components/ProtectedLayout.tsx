import { Box } from '@mui/material';
import { ReactNode } from 'react';
import SidebarComponent from './Sidebar/Sidebar';

// Define an interface for the props
interface ProtectedLayoutProps {
  children: ReactNode;
}

// Use the interface to type the component's props
const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  const closedSidebarWidth = '80px'; // Define the closed sidebar width (adjust if different in SidebarComponent)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%', position: 'relative' }}>
      <SidebarComponent />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          minHeight: '100vh',
          marginLeft: closedSidebarWidth, // Offset the content by the closed sidebar width
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default ProtectedLayout;