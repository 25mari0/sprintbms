// src/components/Sidebar/LogoutMenu.tsx
import React from 'react';
import { Menu, MenuItem } from 'react-pro-sidebar';
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import { useTheme } from '@mui/material';
import styles from './Sidebar.module.css';

interface LogoutMenuProps {
  collapsed: boolean;
  onLogout: () => void;
}

const LogoutMenu: React.FC<LogoutMenuProps> = ({ collapsed, onLogout }) => {
  const theme = useTheme();

  const menuItemStyles = {
    button: {
      '--icon-color': theme.palette.text.secondary,
      color: '#A8C7E2',
      padding: '10px 20px',
      margin: '0 10px',
      borderRadius: '8px',
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
        color: theme.palette.text.primary,
        '--icon-color': '#E3F2FD',
      },
      display: 'flex',
      justifyContent: collapsed ? 'center' : 'flex-start',
      transition: 'all 300ms ease',
    },
    icon: {
      marginRight: collapsed ? '0' : '10px',
      transition: 'margin-right 300ms ease',
    },
    label: {
      fontFamily: 'Roboto, sans-serif',
      fontWeight: '500',
    },
  };

  return (
    <div className={styles.logoutContainer}>
      <Menu menuItemStyles={menuItemStyles}>
        <MenuItem
          icon={<ExitToAppRoundedIcon style={{ fontSize: '20px', color: 'var(--icon-color)' }} />}
          onClick={onLogout}
        >
          Logout
        </MenuItem>
      </Menu>
    </div>
  );
};

export default LogoutMenu;