import React from 'react';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Divider, Typography, Box, Avatar, alpha, useTheme,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/DashboardRounded';
import InventoryIcon from '@mui/icons-material/Inventory2Rounded';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCartRounded';
import PersonIcon from '@mui/icons-material/PersonRounded';
import NotificationsIcon from '@mui/icons-material/NotificationsRounded';
import LogoutIcon from '@mui/icons-material/LogoutRounded';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';

/**
 * Single source of truth for navigation. The Topbar reads this to derive the
 * current page title, so labels never drift between the two.
 */
export const NAV_ITEMS = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', exact: true },
  { text: 'Products', icon: <InventoryIcon />, path: '/dashboard/products' },
  { text: 'Orders', icon: <ShoppingCartIcon />, path: '/dashboard/orders', match: ['/dashboard/order'] },
  { text: 'Profile', icon: <PersonIcon />, path: '/dashboard/profile' },
  { text: 'Notifications', icon: <NotificationsIcon />, path: '/dashboard/notifications' },
];

export const isNavItemActive = (item, pathname) => {
  if (item.exact) return pathname === item.path || pathname === `${item.path}/`;
  const candidates = [item.path, ...(item.match || [])];
  return candidates.some((p) => pathname === p || pathname.startsWith(`${p}/`));
};

const Sidebar = ({ mobileOpen, handleDrawerToggle, drawerWidth }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);

  const handleNavigate = (path) => {
    navigate(path);
    if (mobileOpen) handleDrawerToggle();
  };

  const handleLogout = async () => {
    if (mobileOpen) handleDrawerToggle();
    await dispatch(logout());
    navigate('/login');
  };

  const displayName = user?.businessName || user?.full_name || user?.ownerName || 'Seller Admin';

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      {/* Brand */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2.5,
          minHeight: 70,
          flexShrink: 0,
        }}
      >
        <Box
          component="img"
          src="/favicon.svg"
          alt="LocalMart Seller Hub"
          sx={{
            width: 38,
            height: 38,
            flexShrink: 0,
          }}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            noWrap
            sx={{
              fontWeight: 800,
              lineHeight: 1.2,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Seller Hub
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ fontWeight: 600 }}>
            LocalMart
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mx: 2 }} />

      {/* Nav — scrolls independently so the footer stays reachable */}
      <List sx={{ px: 1.5, py: 2, flex: 1, overflowY: 'auto' }}>
        {NAV_ITEMS.map((item) => {
          const selected = isNavItemActive(item, location.pathname);
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={selected}
                onClick={() => handleNavigate(item.path)}
                sx={{
                  py: 1.15,
                  pl: 2,
                  position: 'relative',
                  color: selected ? 'primary.main' : 'text.secondary',
                  // Left indicator pill rather than a hover translate, which
                  // made the label jitter on every pointer move.
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 3,
                    height: selected ? 22 : 0,
                    borderRadius: '0 3px 3px 0',
                    bgcolor: 'primary.main',
                    transition: 'height .2s ease',
                  },
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.16) },
                  },
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: 'inherit' }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  slotProps={{
                    primary: {
                      sx: {
                        fontWeight: selected ? 700 : 500,
                        fontSize: '0.925rem',
                        color: selected ? 'primary.main' : 'text.primary',
                      },
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer — makes the mobile drawer self-sufficient */}
      <Box sx={{ p: 1.5, pt: 0, flexShrink: 0 }}>
        <Divider sx={{ mb: 1.5, mx: 0.5 }} />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            p: 1.25,
            mb: 0.5,
            borderRadius: 3,
            bgcolor: 'background.subtle',
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              fontSize: '0.9rem',
              bgcolor: 'primary.main',
              flexShrink: 0,
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, lineHeight: 1.3 }}>
              {displayName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.email || 'Seller account'}
            </Typography>
          </Box>
        </Box>

        <ListItemButton
          onClick={handleLogout}
          sx={{
            py: 1,
            color: 'error.main',
            '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) },
          }}
        >
          <ListItemIcon sx={{ minWidth: 38, color: 'inherit' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            slotProps={{ primary: { sx: { fontWeight: 600, fontSize: '0.9rem' } } }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  const paperSx = {
    width: drawerWidth,
    boxSizing: 'border-box',
    borderRight: `1px solid ${theme.palette.divider}`,
    bgcolor: 'background.paper',
  };

  return (
    <>
      {/* Temporary drawer below lg — a 260px permanent rail left small tablets
          with too little room for the data tables. */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', lg: 'none' }, '& .MuiDrawer-paper': paperSx }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        open
        sx={{ display: { xs: 'none', lg: 'block' }, '& .MuiDrawer-paper': paperSx }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
