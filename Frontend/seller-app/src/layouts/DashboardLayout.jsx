import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, alpha, useTheme } from '@mui/material';
import Sidebar from '../components/Sidebar/Sidebar';
import Topbar, { TOPBAR_HEIGHT } from '../components/Topbar/Topbar';

const drawerWidth = 264;

const DashboardLayout = ({ themeMode, toggleTheme }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Decorative glows live in their own clipped, non-interactive layer so
          they never clip real content (dropdowns, sticky bars). Hidden on
          phones, where the blur costs more than it adds. */}
      <Box
        aria-hidden
        sx={{
          position: 'fixed',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0,
          display: { xs: 'none', sm: 'block' },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '-12%',
            left: '-6%',
            width: '40vw',
            height: '40vw',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
            filter: 'blur(80px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '-12%',
            right: '-6%',
            width: '35vw',
            height: '35vw',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.09)} 0%, transparent 70%)`,
            filter: 'blur(80px)',
          }}
        />
      </Box>

      <Topbar
        handleDrawerToggle={handleDrawerToggle}
        drawerWidth={drawerWidth}
        themeMode={themeMode}
        toggleTheme={toggleTheme}
      />

      <Box
        component="nav"
        sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 }, zIndex: 10 }}
      >
        <Sidebar
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
          drawerWidth={drawerWidth}
        />
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // Without minWidth:0 the wide data tables force this flex child past
          // the viewport instead of scrolling inside their own container.
          minWidth: 0,
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Spacer matched to the AppBar height; the default Toolbar spacer is
            64px and left content tucked under the 70px bar. */}
        <Box sx={{ minHeight: `${TOPBAR_HEIGHT}px`, flexShrink: 0 }} />

        <Box
          className="animate-fade-in"
          sx={{
            flex: 1,
            width: '100%',
            maxWidth: 1600,
            mx: 'auto',
            p: { xs: 2, sm: 2.5, md: 3.5 },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
