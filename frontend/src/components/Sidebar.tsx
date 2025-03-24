import { useState } from 'react';
import { Sidebar, Menu, MenuItem, sidebarClasses } from 'react-pro-sidebar';
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import TroubleshootRoundedIcon from '@mui/icons-material/TroubleshootRounded';
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
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
      width="240px"
      transitionDuration={300}
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
      style={{ borderRight: 'none' }}
      rootStyles={{
        [`.${sidebarClasses.container}`]: {
        backgroundColor: '#222831',
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
                padding: '10px 20px',
                margin: '0 10px',
                borderRadius: '10px',
                '&:hover': {
                  backgroundColor: '#F05454',
                },
                display: 'flex',
                justifyContent: collapsed ? 'center' : 'flex-start', // Center icons when collapsed
                transition: 'all 300ms ease', // Smooth transition for alignment change
              },
              icon: {
                marginRight: collapsed ? '0' : '10px', // Remove margin when collapsed to avoid extra spacing
                transition: 'margin-right 300ms ease', // Smooth transition for icon spacing
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
              icon={<SpaceDashboardRoundedIcon style={{ fontSize: '20px' }} />}
              onClick={() => navigate('/dashboard')}
            >
              Bookings
            </MenuItem>
            <MenuItem
              icon={<GroupsRoundedIcon style={{ fontSize: '20px' }} />}
              onClick={() => navigate('/users')}
            >
              Customers
            </MenuItem>
            <MenuItem
              icon={<BadgeRoundedIcon style={{ fontSize: '20px' }} />}
              onClick={() => navigate('/orders')}
            >
              Workers
            </MenuItem>
            <MenuItem
              icon={<FormatListBulletedRoundedIcon style={{ fontSize: '20px' }} />}
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
              icon={<TroubleshootRoundedIcon style={{ fontSize: '20px' }} />}
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
              icon={<SettingsRoundedIcon style={{ fontSize: '20px' }} />}
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
                padding: '10px 20px',
                margin: '0 10px',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: '#F05454',
                },
                display: 'flex',
                justifyContent: collapsed ? 'center' : 'flex-start', // Center icon when collapsed
                transition: 'all 300ms ease', // Smooth transition for alignment change
              },
              icon: {
                marginRight: collapsed ? '0' : '10px', // Remove margin when collapsed
                transition: 'margin-right 300ms ease', // Smooth transition for icon spacing
              },
              label: {
                fontFamily: 'Roboto, sans-serif',
                fontWeight: '500',
              },
            }}
          >
            <MenuItem
              style={{ marginBottom: '10px' }}
              icon={<ExitToAppRoundedIcon style={{ fontSize: '20px' }} />}
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