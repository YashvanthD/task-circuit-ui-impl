import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
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
import ScienceIcon from '@mui/icons-material/Science';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import Drawer from '@mui/material/Drawer';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import RoamingAssistant from '../components/assistant/RoamingAssistant';
import { useThemeMode } from '../contexts';

// Shortened imports for better readability
import {
  clearAccessTokenManagement,
  removeUserFromLocalStorage,
  removeFromLocalStorage,
  clearTasksFromLocalStorage,
  is_admin
} from '../utils';

// Import centralized paths from config.js
import {
    BASE_APP_PATH_USER_DASHBOARD,
    BASE_APP_PATH_USER_TASKS,
    BASE_APP_PATH_USER_POND,
    BASE_APP_PATH_USER_PONDS,
    BASE_APP_PATH_USER_SAMPLING,
    BASE_APP_PATH_USER_REPORTS,
    BASE_APP_PATH_USER_AI,
    BASE_APP_PATH_USER_INVOICE,
    BASE_APP_PATH_USER_EXPENSES,
    BASE_APP_PATH_USER_CHAT,
    BASE_APP_PATH_USER_DATASET,
    BASE_APP_PATH_USER_MANAGE_USERS,
    BASE_APP_PATH_LOGIN,
    BASE_APP_PATH_REGISTER_COMPANY,
    BASE_APP_PATH_USER_SETTINGS, BASE_APP_PATH_SIGNUP
} from '../config';

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
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Responsive breakpoints
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 600-900px
  const isSmallScreen = isMobile || isTablet;

  // Theme mode from context
  const { toggleTheme, isDarkMode } = useThemeMode();

  // Updated navItems to use centralized paths from config.js
  const navItems = [
    { label: 'Dashboard', to: BASE_APP_PATH_USER_DASHBOARD, icon: <DashboardIcon /> },
    { label: 'Tasks', to: BASE_APP_PATH_USER_TASKS, icon: <AssignmentIcon /> },
    { label: 'Pond', to: BASE_APP_PATH_USER_POND, icon: <PoolIcon /> },
    { label: 'Ponds (New)', to: BASE_APP_PATH_USER_PONDS, icon: <PoolIcon /> },
    { label: 'Sampling', to: BASE_APP_PATH_USER_SAMPLING, icon: <ScienceIcon /> },
    { label: 'Reports', to: BASE_APP_PATH_USER_REPORTS, icon: <AnalyticsIcon /> },
    { label: 'Ask AI', to: BASE_APP_PATH_USER_AI, icon: <SmartToyIcon /> },
    { label: 'Invoice', to: BASE_APP_PATH_USER_INVOICE, icon: <ReceiptIcon /> },
    { label: 'Expenses', to: BASE_APP_PATH_USER_EXPENSES, icon: <LocalAtmIcon /> },
    { label: 'Chat', to: BASE_APP_PATH_USER_CHAT, icon: <ChatIcon /> },
    { label: 'Dataset', to: BASE_APP_PATH_USER_DATASET, icon: <StorageIcon /> },
    { label: 'Manage Users', to: BASE_APP_PATH_USER_MANAGE_USERS, icon: <AccountCircleIcon /> },
  ];

  // Bottom nav items (show only main 5 items for mobile bottom nav)
  const bottomNavItems = [
    { label: 'Dashboard', to: BASE_APP_PATH_USER_DASHBOARD, icon: <DashboardIcon /> },
    { label: 'Tasks', to: BASE_APP_PATH_USER_TASKS, icon: <AssignmentIcon /> },
    { label: 'Report', to: BASE_APP_PATH_USER_REPORTS, icon: <AnalyticsIcon /> },
    { label: 'Pond', to: BASE_APP_PATH_USER_POND, icon: <PoolIcon /> },
  ];

  const APPBAR_HEIGHT = 56;
  const DRAWER_WIDTH = collapsed ? 64 : 260;
  const BOTTOM_NAV_HEIGHT = 56;

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  // Get current bottom nav value
  const getCurrentBottomNavValue = () => {
    const currentPath = location.pathname;
    const matchedIndex = bottomNavItems.findIndex(item => currentPath.startsWith(item.to));
    return matchedIndex >= 0 ? matchedIndex : -1;
  };

  // Handle back navigation
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(BASE_APP_PATH_USER_DASHBOARD);
    }
  };

  // Check if we can go back (not on dashboard)
  const canGoBack = location.pathname !== BASE_APP_PATH_USER_DASHBOARD;

  // Profile menu state
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);

  // Robust logout handler: clears timers, tokens, cached user data and tasks, then calls provided onLogout or redirects
  const handleLogout = () => {
    // close menu first
    handleProfileMenuClose();

    // Reset theme to light on logout
    try {
      localStorage.removeItem('themeMode');
      localStorage.removeItem('user_settings');
    } catch (e) {
      // Ignore
    }

    try {
      // stop any token refresh timers
      clearAccessTokenManagement();
    } catch (e) {
      // swallow errors to avoid blocking logout
      // eslint-disable-next-line no-console
      console.warn('clearAccessTokenManagement failed', e);
    }

    try {
      // remove auth tokens and user data from localStorage
      removeUserFromLocalStorage();
      removeFromLocalStorage('access_token');
      removeFromLocalStorage('refresh_token');
      removeFromLocalStorage('access_token_expiry');
      // clear any cached tasks or app-specific state
      clearTasksFromLocalStorage();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Clearing local storage failed', e);
    }

    // call provided logout callback if present
    if (typeof onLogout === 'function') {
      try {
        onLogout();
      } catch (e) {
        // ignore errors from external handler
        // eslint-disable-next-line no-console
        console.warn('onLogout callback threw', e);
      }
    } else {
      // otherwise redirect to login using navigate (respects router basename)
      navigate(BASE_APP_PATH_LOGIN);
    }

    // Force page reload to reset all state including theme
    window.location.reload();
  };

  // delegate admin detection to shared util
  const APP_USER_IS_ADMIN = is_admin(user);

  return (
    <Box sx={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Fixed Top Navigation Bar */}
      <AppBar position="fixed" sx={{ height: APPBAR_HEIGHT, borderRadius: 0,  justifyContent: 'center', bgcolor: 'primary.primary', zIndex: (theme) => theme.zIndex.drawer + 2 }}>
        <Toolbar sx={{ minHeight: APPBAR_HEIGHT, height: APPBAR_HEIGHT, px: { xs: 1, sm: 2 } }}>
          {/* Mobile: Back button or Menu button */}
          {isSmallScreen && showSidebar && loggedIn && (
            <>
              {canGoBack ? (
                <IconButton
                  color="inherit"
                  onClick={handleBack}
                  edge="start"
                  sx={{ mr: 1 }}
                  aria-label="Go back"
                >
                  <ArrowBackIcon />
                </IconButton>
              ) : (
                <IconButton
                  color="inherit"
                  onClick={() => setMobileDrawerOpen(true)}
                  edge="start"
                  sx={{ mr: 1 }}
                  aria-label="Open navigation menu"
                >
                  <MenuIcon />
                </IconButton>
              )}
            </>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'common.white', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            Task Circuit
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* Theme Toggle Button - only for logged in users */}
            {loggedIn && (
              <Tooltip title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                <IconButton
                  color="inherit"
                  onClick={toggleTheme}
                >
                  {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>
            )}
            {!loggedIn && (
              <>
                <Button
                  component={Link}
                  to={BASE_APP_PATH_LOGIN}
                  variant="contained"
                  color="info"
                  sx={{ color: 'common.white', bgcolor: 'info.main', boxShadow: 2, '&:hover': { bgcolor: 'info.dark' } }}
                >
                  Login
                </Button>
                <Button
                  color="primary"
                  variant="contained"
                  sx={{ ml: 2, boxShadow: 2, textTransform: 'none', fontWeight: 500, minWidth: 120 }}
                  to={BASE_APP_PATH_REGISTER_COMPANY}
                  component={Link}
                >
                  Register Company
                </Button>
                <Button
                  component={Link}
                  to={BASE_APP_PATH_SIGNUP}
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
                >
                  <Avatar>{(user?.display_name || user?.name || user?.username || user?.user?.username)?.[0]?.toUpperCase() || '?'}</Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleProfileMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  sx={{
                    minWidth: 220,
                    p: 1.5,
                    boxShadow: 4,
                  }}
                >
                  <MenuItem disabled sx={{ minHeight: 48, fontSize: 16, py: 2 }}>
                    {user?.display_name || user?.name || user?.username || user?.user?.username || 'Profile'}
                  </MenuItem>
                  <MenuItem
                    sx={{ minHeight: 48, fontSize: 16, py: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                    onClick={() => {
                      handleProfileMenuClose();
                      navigate(BASE_APP_PATH_USER_DASHBOARD);
                    }}
                  >
                    <DashboardIcon fontSize="small" />
                    Dashboard
                  </MenuItem>
                  <MenuItem
                    sx={{ minHeight: 48, fontSize: 16, py: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                    onClick={() => {
                      handleProfileMenuClose();
                      navigate(BASE_APP_PATH_USER_SETTINGS);
                    }}
                  >
                    <SettingsIcon fontSize="small" />
                    Settings
                  </MenuItem>
                  <MenuItem
                    onClick={handleLogout}
                    sx={{ minHeight: 48, fontSize: 16, py: 2 }}
                  >
                    Logout
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      {/* Sticky Side Navigation Bar (visible only for user pages on larger screens) */}
      {showSidebar && !isSmallScreen && (
        <Box
          sx={{
            position: 'fixed',
            top: APPBAR_HEIGHT,
            left: 0,
            height: `calc(100vh - ${APPBAR_HEIGHT}px)`,
            width: DRAWER_WIDTH,
            bgcolor: isDarkMode ? 'background.paper' : '#263238',
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
            {navItems
              .filter(i => !(i.to === BASE_APP_PATH_USER_MANAGE_USERS && !APP_USER_IS_ADMIN))
              .map(item => (
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

      {/* Mobile Drawer Navigation */}
      {showSidebar && isSmallScreen && (
        <Drawer
          anchor="left"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: 280,
              bgcolor: isDarkMode ? 'background.paper' : '#263238',
              color: 'common.white',
              pt: 2,
            },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pb: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="h6" sx={{ color: 'common.white' }}>
              Menu
            </Typography>
            <IconButton
              onClick={() => setMobileDrawerOpen(false)}
              sx={{ color: 'grey.400' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <List sx={{ p: 1, overflowY: 'auto', flex: 1 }}>
            {navItems
              .filter(i => !(i.to === BASE_APP_PATH_USER_MANAGE_USERS && !APP_USER_IS_ADMIN))
              .map(item => (
              <ListItemButton
                key={item.to}
                component={NavLink}
                to={item.to}
                onClick={() => setMobileDrawerOpen(false)}
                sx={{
                  borderRadius: 2,
                  color: 'grey.400',
                  py: 1.5,
                  px: 2,
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                    color: 'common.white',
                  },
                  '&.active': {
                    bgcolor: 'primary.main',
                    color: 'common.white',
                  },
                }}
              >
                {item.icon}
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
          {/* User info in mobile drawer */}
          {user && (
            <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {(user?.display_name || user?.name || user?.username || user?.user?.username)?.[0]?.toUpperCase() || '?'}
                </Avatar>
                <Typography variant="body2" sx={{ color: 'grey.300' }}>
                  {user?.display_name || user?.name || user?.username || user?.user?.username || 'User'}
                </Typography>
              </Box>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  navigate(BASE_APP_PATH_USER_SETTINGS);
                }}
                sx={{ mb: 1, color: 'grey.400', borderColor: 'grey.600' }}
                startIcon={<SettingsIcon />}
              >
                Settings
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="error"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Box>
          )}
        </Drawer>
      )}
      {/* Main Content Area, flush with sidebar, scrollable, loads all pages */}
      <Box
        sx={{
          position: 'absolute',
          top: APPBAR_HEIGHT,
          left: showSidebar && !isSmallScreen ? DRAWER_WIDTH : 0,
          width: showSidebar && !isSmallScreen ? `calc(100vw - ${DRAWER_WIDTH}px)` : '100vw',
          height: showSidebar && isMobile
            ? `calc(100vh - ${APPBAR_HEIGHT}px - ${BOTTOM_NAV_HEIGHT}px)`
            : `calc(100vh - ${APPBAR_HEIGHT}px)`,
          overflowY: 'auto',
          bgcolor: 'background.default',
          transition: 'left 0.3s cubic-bezier(.4,0,.2,1), width 0.3s cubic-bezier(.4,0,.2,1)',
          p: { xs: 1.5, sm: 2, md: 3 }, // Responsive padding
        }}
      >
        {children}
      </Box>

      {/* Mobile Bottom Navigation */}
      {showSidebar && isMobile && loggedIn && (
        <BottomNavigation
          value={getCurrentBottomNavValue()}
          onChange={(event, newValue) => {
            if (newValue >= 0 && newValue < bottomNavItems.length) {
              navigate(bottomNavItems[newValue].to);
            }
          }}
          showLabels
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: BOTTOM_NAV_HEIGHT,
            zIndex: (theme) => theme.zIndex.appBar + 1,
            bgcolor: isDarkMode ? 'background.paper' : 'background.default',
            borderTop: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              px: 1,
              '&.Mui-selected': {
                color: 'primary.main',
              },
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.65rem',
              '&.Mui-selected': {
                fontSize: '0.7rem',
              },
            },
          }}
        >
          {bottomNavItems.map((item) => (
            <BottomNavigationAction
              key={item.to}
              label={item.label}
              icon={item.icon}
            />
          ))}
          {/* More button to open full menu */}
          <BottomNavigationAction
            label="More"
            icon={<MenuIcon />}
            onClick={(e) => {
              e.preventDefault();
              setMobileDrawerOpen(true);
            }}
          />
        </BottomNavigation>
      )}

      {showSidebar && !isMobile && <RoamingAssistant />}
    </Box>
  );
}
