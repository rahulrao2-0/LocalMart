import React from 'react';
import { 
  AppBar, Toolbar, IconButton, Typography, Button, Box, Avatar, Menu, MenuItem, Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import NotificationsIcon from '@mui/icons-material/NotificationsNone';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
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
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backdropFilter: 'blur(8px)',
        color: theme.palette.text.primary,
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
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
          <Typography variant="h6" fontWeight="700" noWrap component="div" sx={{ display: { xs: 'none', sm: 'block' } }}>
            Overview
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={toggleTheme} color="inherit">
            {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>
          
          
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, gap: 1 }}>
            <IconButton onClick={handleMenuClick} size="small" sx={{ ml: 2, padding: 0 }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 36, height: 36 }}>
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'S'}
              </Avatar>
            </IconButton>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography variant="subtitle2" fontWeight="600">{user?.full_name || 'Seller Admin'}</Typography>
              <Typography variant="body2" color="textSecondary" fontSize="0.75rem">Manage your store</Typography>
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
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&::before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
          >
            <MenuItem onClick={handleGoToCustomerApp}>
              Switch to Customer App
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
