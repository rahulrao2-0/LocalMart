import React from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Drawer } from '@mui/material';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import BottomNav from '../components/layout/BottomNav';
import { layout } from '../theme';
import { logout } from '../redux/features/authSlice';
import { setMobileNavOpen } from '../redux/features/uiSlice';

const MainLayout = () => {
  const dispatch = useDispatch();
  const { mobileNavOpen, sidebarCollapsed } = useSelector((state) => state.ui);

  const sidebarWidth = sidebarCollapsed ? layout.sidebarCollapsedWidth : layout.sidebarWidth;

  const handleLogout = () => {
    dispatch(setMobileNavOpen(false));
    dispatch(logout());
  };

  // Sidebar rows call this on click: mobile closes the drawer, and the
  // footer button signals a sign-out rather than a route change.
  const handleNavigate = (intent) => {
    if (intent === 'logout') {
      handleLogout();
      return;
    }
    dispatch(setMobileNavOpen(false));
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100svh', bgcolor: 'background.default' }}>
      {/* Desktop: permanent rail */}
      <Box
        component="nav"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: sidebarWidth,
          flexShrink: 0,
          transition: (theme) =>
            theme.transitions.create('width', { duration: theme.transitions.duration.shorter }),
        }}
      >
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            width: sidebarWidth,
            borderRight: '1px solid',
            borderColor: 'divider',
            zIndex: (theme) => theme.zIndex.drawer,
            transition: (theme) =>
              theme.transitions.create('width', { duration: theme.transitions.duration.shorter }),
          }}
        >
          <Sidebar variant="desktop" onNavigate={handleNavigate} />
        </Box>
      </Box>

      {/* Mobile: temporary drawer */}
      <Drawer
        variant="temporary"
        open={mobileNavOpen}
        onClose={() => dispatch(setMobileNavOpen(false))}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: layout.sidebarWidth, borderRight: 'none', boxShadow: 8 },
        }}
      >
        <Sidebar variant="mobile" onNavigate={handleNavigate} />
      </Drawer>

      <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Topbar onLogout={handleLogout} />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: '100%',
            maxWidth: layout.contentMaxWidth,
            mx: 'auto',
            px: { xs: 1.75, sm: 2.5, lg: 3 },
            pt: { xs: 2, sm: 2.5 },
            // Reserve room for the mobile bottom bar (plus the home indicator).
            pb: {
              xs: `calc(${layout.bottomNavHeight}px + 24px + env(safe-area-inset-bottom))`,
              md: 4,
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>

      <BottomNav />
    </Box>
  );
};

export default MainLayout;
