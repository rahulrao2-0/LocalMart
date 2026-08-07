import React from 'react';
import { 
  AppBar, Toolbar, IconButton, Typography, Box, Avatar, Menu, MenuItem, Divider, alpha, useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import NotificationBell from '../NotificationBell';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ handleDrawerToggle, drawerWidth, themeMode, toggleTheme }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await dispatch(logout());
    navigate('/login');
  };

  const handleGoToCustomerApp = () => {
    handleMenuClose();
    window.location.href = 'http://localhost:5173';
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        backgroundColor: alpha(theme.palette.background.paper, 0.7),
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
        zIndex: theme.zIndex.drawer + 1,
        transition: 'all 0.3s ease'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 }, minHeight: '70px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" fontWeight="800" noWrap component="div" sx={{ display: { xs: 'none', sm: 'block' }, letterSpacing: '-0.02em' }}>
            Dashboard Overview
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          <Box sx={{ 
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderRadius: '50%',
            p: 0.5
          }}>
            <IconButton onClick={toggleTheme} color="primary" sx={{ 
              transition: 'transform 0.2s', 
              '&:hover': { transform: 'rotate(15deg)', bgcolor: alpha(theme.palette.primary.main, 0.1) } 
            }}>
              {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Box>
          
          <Box sx={{ 
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderRadius: '50%',
            p: 0.5
          }}>
            <NotificationBell />
          </Box>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 2, opacity: 0.5 }} />
          
          <Box 
            onClick={handleMenuClick} 
            sx={{ 
              display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer',
              p: 0.5, pr: 2, borderRadius: 10,
              transition: 'background 0.2s',
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
            }}
          >
            <Avatar sx={{ 
              bgcolor: theme.palette.primary.main, 
              width: 40, height: 40,
              boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
              fontWeight: 800
            }}>
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'S'}
            </Avatar>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography variant="subtitle2" fontWeight="700" lineHeight={1.2}>
                {user?.full_name || 'Seller Admin'}
              </Typography>
              <Typography variant="caption" color="textSecondary" fontWeight="600">
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
            PaperProps={{
              elevation: 0,
              className: 'glass-panel',
              sx: {
                overflow: 'visible',
                filter: `drop-shadow(0px 10px 30px ${alpha('#000', 0.1)})`,
                mt: 1.5, minWidth: 200, borderRadius: 3,
                '& .MuiMenuItem-root': { py: 1.5, px: 2, fontWeight: 600, borderRadius: 2, mx: 1, my: 0.5 },
                '& .MuiMenuItem-root:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                '&::before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0, right: 20,
                  width: 12, height: 12,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
          >
            <MenuItem onClick={handleGoToCustomerApp}>Switch to Customer App</MenuItem>
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
