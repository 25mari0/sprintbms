import React from 'react';
import { Menu, MenuItem } from 'react-pro-sidebar';
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import TroubleshootRoundedIcon from '@mui/icons-material/TroubleshootRounded';
import { useTheme } from '@mui/material';
import styles from './Sidebar.module.css';
import { useAuthStore } from '../../stores/authStore'; 

interface NavigationMenuProps {
  collapsed: boolean;
  navigate: (path: string) => void;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({ collapsed, navigate }) => {
  const theme = useTheme();
  const { user } = useAuthStore(); 
  const menuItemStyles = {
    button: {
      '--icon-color': theme.palette.text.secondary,
      color: '#A8C7E2',
      padding: '10px 20px',
      margin: '0 10px',
      borderRadius: '8px',
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
        color: theme.palette.primary.contrastText,
        '--icon-color': '#fff',
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
      fontFamily: 'Inter, sans-serif',
      fontSize: '0.875rem',
      fontWeight: '400',
    },
  };

  // Determine if the user can see the Workers menu item
  const canSeeWorkers = user?.role === 'owner';

  return (
    <Menu menuItemStyles={menuItemStyles}>
      {!collapsed && (
        <MenuItem disabled className={styles.sectionTitle} style={{ color: theme.palette.text.disabled}}>
          WORKSPACE
        </MenuItem>
      )}
      <MenuItem
        icon={<SpaceDashboardRoundedIcon style={{ fontSize: '20px', color: 'var(--icon-color)' }} />}
        onClick={() => navigate('/bookings')}
      >
        Bookings
      </MenuItem>
      <MenuItem
        icon={<GroupsRoundedIcon style={{ fontSize: '20px', color: 'var(--icon-color)' }} />}
        onClick={() => navigate('/customers')}
      >
        Customers
      </MenuItem>
      {canSeeWorkers && (
        <MenuItem
          icon={<BadgeRoundedIcon style={{ fontSize: '20px', color: 'var(--icon-color)' }} />}
          onClick={() => navigate('/workers')}
        >
          Workers
        </MenuItem>
      )}
      <MenuItem
        icon={<FormatListBulletedRoundedIcon style={{ fontSize: '20px', color: 'var(--icon-color)' }} />}
        onClick={() => navigate('/services')}
      >
        Services
      </MenuItem>
      {!collapsed && (
        <MenuItem disabled className={styles.sectionTitle} style={{ color: theme.palette.text.disabled }}>
          ANALYTICS
        </MenuItem>
      )}
      <MenuItem
        icon={<TroubleshootRoundedIcon style={{ fontSize: '20px', color: 'var(--icon-color)' }} />}
        onClick={() => navigate('/analytics')}
      >
        Insights
      </MenuItem>
      {!collapsed && (
        <MenuItem disabled className={styles.sectionTitle} style={{ color: theme.palette.text.disabled }}>
          SETTINGS
        </MenuItem>
      )}
      <MenuItem
        icon={<SettingsRoundedIcon style={{ fontSize: '20px', color: 'var(--icon-color)' }} />}
        onClick={() => navigate('/settings')}
      >
        Settings
      </MenuItem>
    </Menu>
  );
};

export default NavigationMenu;