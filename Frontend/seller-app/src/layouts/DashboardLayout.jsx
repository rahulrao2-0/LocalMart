import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar, alpha, useTheme } from '@mui/material';
import Sidebar from '../components/Sidebar/Sidebar';
import Topbar from '../components/Topbar/Topbar';

const drawerWidth = 260;

const DashboardLayout = ({ themeMode, toggleTheme }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      bgcolor: 'background.default',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Subtle Background Glows */}
      <Box sx={{
        position: 'fixed', top: '-10%', left: '-5%', width: '40vw', height: '40vw',
        borderRadius: '50%', background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 70%)`,
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0
      }} />
      <Box sx={{
        position: 'fixed', bottom: '-10%', right: '-5%', width: '35vw', height: '35vw',
        borderRadius: '50%', background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.08)} 0%, transparent 70%)`,
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0
      }} />

      <Topbar 
        handleDrawerToggle={handleDrawerToggle} 
        drawerWidth={drawerWidth} 
        themeMode={themeMode}
        toggleTheme={toggleTheme}
      />
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 }, zIndex: 10 }}
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
          p: { xs: 2, sm: 3, md: 4 }, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          zIndex: 1,
          position: 'relative'
        }}
      >
        <Toolbar />
        <Box className="animate-fade-in" sx={{ maxWidth: '1600px', mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
