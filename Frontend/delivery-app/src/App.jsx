import React, { useMemo } from 'react';
import { io } from 'socket.io-client';
import { fetchDeliveries } from './redux/features/deliveriesSlice';
import { fetchDashboardData } from './redux/features/dashboardSlice';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider, CssBaseline, Snackbar, Alert } from '@mui/material';
import AppRoutes from './routes/AppRoutes';
import { getTheme } from './theme';
import { clearToast } from './redux/features/uiSlice';

function GlobalToast() {
  const dispatch = useDispatch();
  const toast = useSelector((state) => state.ui.toast);

  return (
    <Snackbar
      open={Boolean(toast)}
      autoHideDuration={3200}
      onClose={() => dispatch(clearToast())}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ bottom: { xs: 'calc(80px + env(safe-area-inset-bottom))', md: 24 } }}
    >
      <Alert
        severity={toast?.severity || 'success'}
        variant="filled"
        onClose={() => dispatch(clearToast())}
        sx={{ borderRadius: 3, boxShadow: 6, alignItems: 'center' }}
      >
        {toast?.message}
      </Alert>
    </Snackbar>
  );
}

import socket from './utils/socket';

function SocketManager() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  React.useEffect(() => {
    if (!user) return;
    const userId = user.id || user._id;
    if (!userId) return;

    socket.connect();
    
    // We only want to attach these listeners once, so remove any previous ones
    socket.off('connect');
    socket.off('notification');

    socket.on('connect', () => {
      socket.emit('join', userId);
      console.log('🔗 Connected to live websocket streams');
    });

    socket.on('notification', (newNotif) => {
      console.log('🔔 Live Notification Received:', newNotif);
      // If a new delivery is assigned, or status is updated, refresh Redux
      dispatch(fetchDeliveries());
      dispatch(fetchDashboardData());
    });

    return () => socket.disconnect();
  }, [user, dispatch]);

  return null;
}

function App() {
  const themeMode = useSelector((state) => state.ui.themeMode);
  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  // Explicitly ask for location permissions on app startup
  React.useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Delivery location granted:", position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("Delivery location permission denied or failed:", error.message);
        }
      );
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppRoutes />
      </Router>
      <GlobalToast />
      <SocketManager />
    </ThemeProvider>
  );
}

export default App;
