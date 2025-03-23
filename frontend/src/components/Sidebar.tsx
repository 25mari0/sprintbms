import { useState } from 'react';
import { Sidebar, Menu, MenuItem, sidebarClasses } from 'react-pro-sidebar';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { post } from '../services/api'; // Adjust path to your API service
import AppLogo from '../assets/logo.png'; // Adjust the path to your logo file

const SidebarComponent = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true); // Start collapsed

  const handleLogout = async () => {
    await post('/client/logout');
  };

  return (
    <Sidebar
    className="custom-sidebar"
      collapsed={collapsed}
      collapsedWidth="80px"
      width="180px"
      transitionDuration={300}
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
      style={{ borderRight: 'none' }}
      rootStyles={{
        [`.${sidebarClasses.container}`]: {
        backgroundColor: '#2c2c2c',
        height: '100vh',
        },
      }}
    >
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo and Navigation */}
      <div>
        {/* Logo Container */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '60px',
            paddingTop: '20px',
            paddingLeft: '20px',
            overflow: 'hidden',
          }}
        >
          <img
            src={AppLogo}
            alt="App Logo"
            style={{ width: '40px', height: '40px' }}
          />
          {!collapsed && (
            <span style={{ color: '#ffffff', marginLeft: '10px', fontFamily: 'Roboto, sans-serif' }}>
              <span style={{ fontWeight: '400' }}>sprint</span>
              <span style={{ fontWeight: '600' }}>BMS</span>
            </span>
          )}
        </div>

        {/* Main Navigation Items */}
        <Menu
         menuItemStyles={{
          button: {
            '&:hover': {
              backgroundColor: '#4a4a4a', // Background color on hover
            },
          },
        }}>
          <MenuItem style={{ marginTop: '10px' }}
            icon={<DashboardIcon style={{ fontSize: '24px', fontFamily: 'Roboto, sans-serif', fontWeight: '500' }} />}
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </MenuItem>
          <MenuItem
            icon={<SettingsIcon style={{ fontSize: '24px', fontFamily: 'Roboto, sans-serif', fontWeight: '500' }} />}
            onClick={() => navigate('/settings')}
          >
            Settings
          </MenuItem>
        </Menu>
      </div>

      {/* Logout at the Bottom */}
      <div style={{ marginTop: 'auto' }}>
        <Menu
                 menuItemStyles={{
                  button: {
                    '&:hover': {
                      backgroundColor: '#4a4a4a', // Background color on hover
                    },
                  },
                }}>
          <MenuItem
            icon={<LogoutIcon style={{ fontSize: '24px', fontFamily: 'Roboto, sans-serif', fontWeight: '500' }} />}
            onClick={handleLogout}
          >
            Logout
          </MenuItem>
        </Menu>
      </div>
    </div>
  </Sidebar>
  );
};

export default SidebarComponent;