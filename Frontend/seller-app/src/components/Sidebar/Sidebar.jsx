import React from 'react';
import { 
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Toolbar, Typography, Box 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/DashboardRounded';
import InventoryIcon from '@mui/icons-material/Inventory2Rounded';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCartRounded';
import PersonIcon from '@mui/icons-material/PersonRounded';
import NotificationsIcon from '@mui/icons-material/NotificationsRounded';
import StorefrontIcon from '@mui/icons-material/StorefrontRounded';
import { useLocation, useNavigate } from 'react-router-dom';

const Sidebar = ({ mobileOpen, handleDrawerToggle, drawerWidth }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Products', icon: <InventoryIcon />, path: '/dashboard/products' },
    { text: 'Orders', icon: <ShoppingCartIcon />, path: '/dashboard/orders' },
    { text: 'Profile', icon: <PersonIcon />, path: '/dashboard/profile' },
    { text: 'Notifications', icon: <NotificationsIcon />, path: '/dashboard/notifications' },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: theme.palette.background.paper }}>
      <Toolbar sx={{ my: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ 
          width: 36, height: 36, borderRadius: '10px', 
          background: 'linear-gradient(135deg, #2B3467 0%, #EB455F 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <StorefrontIcon sx={{ color: 'white', fontSize: 20 }} />
        </Box>
        <Typography variant="h6" fontWeight="800" sx={{ background: 'linear-gradient(90deg, #2B3467, #EB455F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Seller Hub
        </Typography>
      </Toolbar>
      <Divider sx={{ mx: 2, mb: 2, opacity: 0.5 }} />
      <List sx={{ px: 2 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                selected={isSelected}
                onClick={() => {
                  navigate(item.path);
                  if (mobileOpen) handleDrawerToggle();
                }}
                sx={{
                  borderRadius: '12px',
                  py: 1.2,
                  transition: 'all 0.2s',
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main + '15',
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.main + '25',
                    }
                  },
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                    transform: 'translateX(4px)',
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  color: isSelected ? theme.palette.primary.main : theme.palette.text.secondary,
                  minWidth: 40 
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  slotProps={{ 
                    primary: { 
                      sx: {
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: '0.95rem'
                      }
                    }
                  }} 
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{ 
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.palette.mode === 'light' ? '4px 0 24px rgba(0,0,0,0.02)' : 'none'
          }
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{ 
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.palette.mode === 'light' ? '4px 0 24px rgba(0,0,0,0.02)' : 'none'
          }
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
