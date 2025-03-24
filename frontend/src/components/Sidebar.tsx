import { useState } from 'react';
import { Sidebar, Menu, MenuItem, sidebarClasses } from 'react-pro-sidebar';
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import TroubleshootRoundedIcon from '@mui/icons-material/TroubleshootRounded';
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import { data, useNavigate } from 'react-router-dom';
import { post } from '../services/api'; // Adjust path to your API service
import AppLogo from '../assets/trace.svg';


const SidebarComponent = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true); // Start collapsed

  const handleLogout = async () => {
    await post('/client/logout', data, undefined, { toastMessage: 'Logged out sucessfully', toastType: 'info' });
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
        position: 'absolute', // Ensure the sidebar stays in the document flow
        borderRight: 'none',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 1000, // Ensure it’s above the main content
      }}
      rootStyles={{
        [`.${sidebarClasses.container}`]: {
          backgroundColor: '#1E1E1E',
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
              marginBottom: '20px',
              overflow: 'hidden',
            }}
          >
            <img
              src={AppLogo}
              alt="App Logo"
              style={{ 
                width: '40px', 
                height: '40px',
               }}
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
                '--icon-color': '#abb4c8', // Default icon color via CSS variable
                color: '#abb4c8', // Default text color
                padding: '10px 20px',
                margin: '0 10px',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: '#1E4B9E',
                  color: '#fff', // Text color on hover
                  '--icon-color': '#e3f2fd', // Icon color on hover via CSS variable
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
            }}
          >
            {/* Workspace Section */}
            {!collapsed && (
              <MenuItem
                disabled
                style={{
                  color: '#888',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  padding: '10px 20px',
                  marginTop: '20px',
                  cursor: 'default',
                }}
              >
                WORKSPACE
              </MenuItem>
            )}
            <MenuItem
              icon={<SpaceDashboardRoundedIcon style={{ fontSize: '20px', color: 'var(--icon-color)' }} />}
              onClick={() => navigate('/dashboard')}
            >
              Bookings
            </MenuItem>
            <MenuItem
              icon={<GroupsRoundedIcon style={{ fontSize: '20px', color: 'var(--icon-color)' }} />}
              onClick={() => navigate('/users')}
            >
              Customers
            </MenuItem>
            <MenuItem
              icon={<BadgeRoundedIcon style={{ fontSize: '20px', color: 'var(--icon-color)' }} />}
              onClick={() => navigate('/orders')}
            >
              Workers
            </MenuItem>
            <MenuItem
              icon={<FormatListBulletedRoundedIcon style={{ fontSize: '20px', color: 'var(--icon-color)' }} />}
              onClick={() => navigate('/orders')}
            >
              Services
            </MenuItem>

            {/* Analytics Section */}
            {!collapsed && (
              <MenuItem
                disabled
                style={{
                  color: '#888',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  padding: '10px 20px',
                  marginTop: '20px',
                  cursor: 'default',
                }}
              >
                ANALYTICS
              </MenuItem>
            )}
            <MenuItem
              icon={<TroubleshootRoundedIcon style={{ fontSize: '20px', color: 'var(--icon-color)' }} />}
              onClick={() => navigate('/analytics')}
            >
              Insights
            </MenuItem>

            {/* Settings Section */}
            {!collapsed && (
              <MenuItem
                disabled
                style={{
                  color: '#888',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  padding: '10px 20px',
                  marginTop: '20px',
                  cursor: 'default',
                }}
              >
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
        </div>

        {/* Logout at the Bottom */}
        <div style={{ marginTop: 'auto' }}>
          <Menu
            menuItemStyles={{
              button: {
                '--icon-color': '#abb4c8', // Default icon color via CSS variable
                color: '#abb4c8', // Default text color
                padding: '10px 20px',
                margin: '0 10px',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: '#3c4257',
                  color: '#e3f2fd', // Text color on hover
                  '--icon-color': '#e3f2fd', // Icon color on hover via CSS variable
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
            }}
          >
            <MenuItem
              style={{ marginBottom: '10px' }}
              icon={<ExitToAppRoundedIcon style={{ fontSize: '20px', color: 'var(--icon-color)' }} />}
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