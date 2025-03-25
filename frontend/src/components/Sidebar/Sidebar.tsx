// src/components/Sidebar/Sidebar.tsx
import React, { useState } from 'react';
import { Sidebar, sidebarClasses } from 'react-pro-sidebar';
import { useNavigate } from 'react-router-dom';
import { post } from '../../services/api';
import Logo from './Logo';
import NavigationMenu from './NavigationMenu';
import LogoutMenu from './LogoutMenu';
import styles from './Sidebar.module.css';
import { useTheme } from '@mui/material';

const SidebarComponent: React.FC = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);
  const theme = useTheme();

  const handleLogout = async () => {
    await post('/client/logout', undefined, undefined, {
      toastMessage: 'Logged out successfully',
      toastType: 'info',
    });
  };

  return (
    <Sidebar
      className="custom-sidebar"
      collapsed={collapsed}
      collapsedWidth="80px"
      width="240px"
      transitionDuration={300}
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100vh',
        borderRight: 'none',
        zIndex: 1000,
      }}
      rootStyles={{
        [`.${sidebarClasses.container}`]: {
          backgroundColor: theme.palette.background.paper,
          height: '100vh',
        },
      }}
    >
      <div className={styles.container}>
        <Logo collapsed={collapsed} />
        <NavigationMenu collapsed={collapsed} navigate={navigate} />
        <LogoutMenu collapsed={collapsed} onLogout={handleLogout} />
      </div>
    </Sidebar>
  );
};

export default SidebarComponent;