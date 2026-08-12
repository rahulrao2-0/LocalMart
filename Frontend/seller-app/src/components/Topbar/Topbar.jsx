import React from 'react';
import {
  AppBar, Toolbar, IconButton, Typography, Box, Avatar, Menu, MenuItem,
  Divider, Tooltip, ListItemIcon, alpha, useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/MenuRounded';
import DarkModeIcon from '@mui/icons-material/DarkModeRounded';
import LightModeIcon from '@mui/icons-material/LightModeRounded';
import LogoutIcon from '@mui/icons-material/LogoutRounded';
import StorefrontIcon from '@mui/icons-material/StorefrontRounded';
import PersonIcon from '@mui/icons-material/PersonRounded';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import NotificationBell from '../NotificationBell';
import { NAV_ITEMS, isNavItemActive } from '../Sidebar/Sidebar';

export const TOPBAR_HEIGHT = 70;

const Topbar = ({ handleDrawerToggle, drawerWidth, themeMode, toggleTheme }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  // Derive the title from the route instead of hardcoding "Dashboard Overview",
  // which was shown on every page.
  const activeItem = NAV_ITEMS.find((item) => isNavItemActive(item, location.pathname));
  const pageTitle = activeItem?.text === 'Dashboard' ? 'Dashboard Overview' : activeItem?.text || 'Seller Hub';

  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    handleMenuClose();
    await dispatch(logout());
    navigate('/login');
  };

  const displayName = user?.businessName || user?.full_name || user?.ownerName || 'Seller Admin';
  const isDark = themeMode === 'dark';

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { lg: `calc(100% - ${drawerWidth}px)` },
        ml: { lg: `${drawerWidth}px` },
        bgcolor: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: 'text.primary',
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          gap: 1,
          px: { xs: 1.5, sm: 2.5, md: 3 },
          minHeight: `${TOPBAR_HEIGHT}px !important`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
          <IconButton
            color="inherit"
            aria-label="Open navigation menu"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: { xs: 0.5, sm: 1.5 }, display: { lg: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="h1"
            sx={{ fontWeight: 800, letterSpacing: '-0.02em', minWidth: 0 }}
          >
            {pageTitle}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.25, sm: 1 }, flexShrink: 0 }}>
          <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton
              onClick={toggleTheme}
              aria-label="Toggle color mode"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              {isDark ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          <NotificationBell />

          <Divider
            orientation="vertical"
            flexItem
            sx={{ mx: 1, my: 2, display: { xs: 'none', sm: 'block' } }}
          />

          <Box
            component="button"
            type="button"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            aria-label="Open account menu"
            aria-haspopup="menu"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              cursor: 'pointer',
              border: 0,
              font: 'inherit',
              color: 'inherit',
              p: 0.5,
              pr: { xs: 0.5, md: 1.5 },
              borderRadius: 99,
              bgcolor: 'transparent',
              transition: 'background-color .2s ease',
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
            }}
          >
            <Avatar
              sx={{
                width: 38,
                height: 38,
                bgcolor: 'primary.main',
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.35)}`,
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </Avatar>
            {/* Text block is dead weight below md — avatar alone carries it. */}
            <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'left', minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, lineHeight: 1.25, maxWidth: 160 }}>
                {displayName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ fontWeight: 600 }}>
                Manage your store
              </Typography>
            </Box>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{ paper: { sx: { minWidth: 224, py: 0.5 } } }}
          >
            <Box sx={{ px: 2, py: 1.25, display: { md: 'none' } }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
                {displayName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user?.email || 'Seller account'}
              </Typography>
            </Box>
            <Divider sx={{ display: { md: 'none' }, mb: 0.5 }} />

            <MenuItem onClick={() => navigate('/dashboard/profile')}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              My Profile
            </MenuItem>
            <MenuItem onClick={() => { window.location.href = 'http://localhost:5173'; }}>
              <ListItemIcon>
                <StorefrontIcon fontSize="small" />
              </ListItemIcon>
              Customer App
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" color="error" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
