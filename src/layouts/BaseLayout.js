import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import { NavLink, Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Fade from '@mui/material/Fade';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import StorageIcon from '@mui/icons-material/Storage';
import PoolIcon from '@mui/icons-material/Pool'; // Use PoolIcon as fish icon if FishIcon is not available
import ChatIcon from '@mui/icons-material/Chat';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import SettingsIcon from '@mui/icons-material/Settings';

/**
 * BaseLayout is the base model for all pages in the Task Circuit project.
 *
 * Instructions to achieve this layout:
 * 1. Use BaseLayout as the wrapper for all page components in your app (see App.js for example usage).
 * 2. The top navigation bar is fixed and sticky, displaying the project name and key action buttons (Login, Register Company, Signup) on the right.
 * 3. The sidebar is sticky, visually floating with margin, shadow, and rounded corners, and contains navigation buttons with active/hover states.
 * 4. The main content container is flush with the sidebar, scrollable, and loads all page content. Only this container updates on route changes.
 * 5. All buttons use modern color schemes, shadows, and spacing for best UI and accessibility.
 * 6. To add new pages, update navItems and your router configuration in App.js.
 * 7. For authentication logic, pass the correct loggedIn prop to BaseLayout.
 *
 * This layout ensures a consistent, modern, and user-friendly experience across the entire Task Circuit project.
 */

/**
 * BaseLayout with fixed top nav, sticky sidebar, and flush scrollable container.
 * All page content loads inside the container only.
 * @param {object} props
 * @returns {JSX.Element}
 */
export default function BaseLayout({ children, loggedIn, user, onLogout, showSidebar = false }) {
  const [collapsed, setCollapsed] = useState(false);
  const navItems = [
    { label: 'Dashboard', to: '/taskcircuit/user/dashboard', icon: <DashboardIcon /> },
    { label: 'Tasks', to: '/taskcircuit/user/tasks', icon: <AssignmentIcon /> },
    { label: 'Chat', to: '/taskcircuit/user/chat', icon: <ChatIcon /> },
    { label: 'Pond', to: '/taskcircuit/user/pond', icon: <PoolIcon /> }, // Fish icon (PoolIcon as substitute)
    { label: 'Reports', to: '/taskcircuit/user/reports', icon: <AnalyticsIcon /> }, // Analytics icon
    { label: 'Invoice', to: '/taskcircuit/user/invoice', icon: <ReceiptIcon /> },
    { label: 'Sales Tax', to: '/taskcircuit/user/sales-tax', icon: <LocalAtmIcon /> },
    { label: 'Dataset', to: '/taskcircuit/user/dataset', icon: <StorageIcon /> }, // Database icon
    { label: 'Manage Users', to: '/taskcircuit/user/manage-users', icon: <AccountCircleIcon /> },
    // Removed Settings from sidebar
  ];

  const APPBAR_HEIGHT = 56;
  const DRAWER_WIDTH = collapsed ? 64 : 260;

  // Profile menu state
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);

  return (
    <Box sx={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Fixed Top Navigation Bar */}
      <AppBar position="fixed" sx={{ height: APPBAR_HEIGHT, justifyContent: 'center', bgcolor: 'primary.main', zIndex: (theme) => theme.zIndex.drawer + 2 }}>
        <Toolbar sx={{ minHeight: APPBAR_HEIGHT, height: APPBAR_HEIGHT, px: 2 }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'common.white' }}>
            Task Circuit
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {!loggedIn && (
              <>
                <Button
                  component={Link}
                  to="/taskcircuit/login"
                  variant="contained"
                  color="info"
                  sx={{ color: 'common.white', bgcolor: 'info.main', boxShadow: 2, '&:hover': { bgcolor: 'info.dark' } }}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/taskcircuit/register-company"
                  variant="contained"
                  color="success"
                  sx={{ color: 'common.white', bgcolor: 'success.main', boxShadow: 2, '&:hover': { bgcolor: 'success.dark' } }}
                >
                  Register Company
                </Button>
                <Button
                  component={Link}
                  to="/taskcircuit/signup"
                  variant="contained"
                  color="warning"
                  sx={{ color: 'common.black', bgcolor: 'warning.main', boxShadow: 2, '&:hover': { bgcolor: 'warning.dark', color: 'common.white' } }}
                >
                  Signup
                </Button>
              </>
            )}
            {loggedIn && user && (
              <>
                <IconButton
                  size="large"
                  edge="end"
                  color="inherit"
                  onClick={handleProfileMenuOpen}
                  sx={{ ml: 2 }}
                >
                  <Avatar>{user?.user?.username?.[0]?.toUpperCase() || user?.account_key?.[0] || '?'}</Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleProfileMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  PaperProps={{
                    sx: {
                      minWidth: 220,
                      p: 1.5,
                      boxShadow: 4,
                    }
                  }}
                >
                  <MenuItem disabled sx={{ minHeight: 48, fontSize: 16, py: 2 }}>
                    {user?.user?.username || user?.account_key || 'Profile'}
                  </MenuItem>
                  <MenuItem
                    sx={{ minHeight: 48, fontSize: 16, py: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                    onClick={() => {
                      handleProfileMenuClose();
                      window.location.href = '/taskcircuit/user/settings';
                    }}
                  >
                    <SettingsIcon fontSize="small" />
                    Settings
                  </MenuItem>
                  <MenuItem onClick={() => { handleProfileMenuClose(); onLogout(); }} sx={{ minHeight: 48, fontSize: 16, py: 2 }}>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      {/* Sticky Side Navigation Bar (visible only for user pages) */}
      {showSidebar && (
        <Box
          sx={{
            position: 'fixed',
            top: APPBAR_HEIGHT,
            left: 0,
            height: `calc(100vh - ${APPBAR_HEIGHT}px)`,
            width: DRAWER_WIDTH,
            bgcolor: '#263238',
            color: 'common.white',
            boxShadow: 'none',
            borderRadius: 0,
            zIndex: (theme) => theme.zIndex.appBar - 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'width 0.3s cubic-bezier(.4,0,.2,1)',
          }}
        >
          <List sx={{ p: 0, m: 0 }}>
            {navItems.map(item => (
              <ListItemButton
                key={item.to}
                component={NavLink}
                to={item.to}
                sx={{
                  borderRadius: 2,
                  color: 'grey.400',
                  py: 1.5,
                  px: collapsed ? 1 : 3,
                  mb: 2,
                  mx: 2,
                  mt: 1,
                  boxShadow: '0 4px 16px 0 rgba(0,0,0,0.28), 0 1.5px 4px 0 rgba(0,0,0,0.18)',
                  background: 'secondary.main', // use theme secondary color
                  display: 'flex',
                  alignItems: 'center',
                  gap: collapsed ? 0 : 2,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  minWidth: 0,
                  transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
                  '&:hover': {
                    boxShadow: '0 8px 24px 0 rgba(0,0,0,0.38), 0 3px 8px 0 rgba(0,0,0,0.22)',
                    background: 'primary.light',
                    color: 'primary.dark',
                  },
                  '&.active': {
                    bgcolor: 'primary.light',
                    color: 'primary.dark',
                    boxShadow: '0 12px 32px 0 rgba(0,0,0,0.48), 0 6px 16px 0 rgba(0,0,0,0.32)',
                  },
                }}
              >
                {item.icon}
                <Fade in={!collapsed} timeout={collapsed ? 100 : 500} unmountOnExit>
                  <ListItemText primary={item.label} sx={{ ml: 2, color: 'grey.400' }} />
                </Fade>
              </ListItemButton>
            ))}
          </List>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              sx={{ minWidth: 0, p: 1, borderRadius: '50%', boxShadow: 2, transition: 'transform 0.3s', transform: collapsed ? 'rotate(180deg)' : 'none' }}
              onClick={() => setCollapsed(c => !c)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronLeftIcon />
            </Button>
          </Box>
        </Box>
      )}
      {/* Main Content Area, flush with sidebar, scrollable, loads all pages */}
      <Box
        sx={{
          position: 'absolute',
          top: APPBAR_HEIGHT,
          left: showSidebar ? DRAWER_WIDTH : 0,
          width: showSidebar ? `calc(100vw - ${DRAWER_WIDTH}px)` : '100vw',
          height: `calc(100vh - ${APPBAR_HEIGHT}px)`,
          overflowY: 'auto',
          bgcolor: 'background.default',
          transition: 'left 0.3s cubic-bezier(.4,0,.2,1), width 0.3s cubic-bezier(.4,0,.2,1)',
          p: 3, // <-- Add padding here
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
