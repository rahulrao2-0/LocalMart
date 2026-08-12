import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Skeleton, CircularProgress, Stack, Typography } from '@mui/material';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import { fetchMe } from '../redux/features/authSlice';
import EmptyState from '../components/EmptyState';
import useGeolocation from '../hooks/useGeolocation';
import { apiFetch } from '../utils/api';

const LocationTracker = () => {
  const { position, error } = useGeolocation({ watch: true });
  const { user } = useSelector((state) => state.auth);
  
  useEffect(() => {
    if (!position || !user) return;
    
    const interval = setInterval(async () => {
      try {
        console.log(`📍 Updating location for ${user.id} to:`, position.lat, position.lng);
        // Note: Real endpoint for location update needs to be added to backend
        // await apiFetch(`/delivery/partner/${user.id}/location`, {
        //   method: 'PUT',
        //   body: JSON.stringify({ lat: position.lat, lng: position.lng })
        // });
      } catch (err) {
        console.error('Failed to update location:', err);
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [position, user]);

  return null;
};

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';

// Auth pages stay eager — they're the first paint for signed-out drivers.
import Login from '../pages/Auth/Login';
import Signup from '../pages/Auth/Signup';
import VerifyOtp from '../pages/Auth/VerifyOtp';

// Protected pages are split out so Leaflet and Recharts don't land in the
// initial bundle.
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const Deliveries = lazy(() => import('../pages/Deliveries/Deliveries'));
const DeliveryDetail = lazy(() => import('../pages/Deliveries/DeliveryDetail'));
const LiveMap = lazy(() => import('../pages/LiveMap/LiveMap'));
const History = lazy(() => import('../pages/History/History'));
const Earnings = lazy(() => import('../pages/Earnings/Earnings'));
const Profile = lazy(() => import('../pages/Profile/Profile'));
const Notifications = lazy(() => import('../pages/Notifications/Notifications'));
const Settings = lazy(() => import('../pages/Settings/Settings'));

/** Skeleton shown while a route chunk downloads. */
const RouteFallback = () => (
  <Box>
    <Skeleton variant="text" width={220} sx={{ fontSize: '2rem', mb: 3 }} />
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
        gap: 2,
        mb: 3,
      }}
    >
      {[0, 1, 2, 3].map((key) => (
        <Skeleton key={key} variant="rounded" height={132} sx={{ borderRadius: 4 }} />
      ))}
    </Box>
    <Skeleton variant="rounded" height={320} sx={{ borderRadius: 4 }} />
  </Box>
);

const FullScreenLoader = () => (
  <Stack sx={{ minHeight: '100svh' }} alignItems="center" justifyContent="center" spacing={2}>
    <CircularProgress />
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      Checking your session…
    </Typography>
  </Stack>
);

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '100svh', display: 'grid', placeItems: 'center', p: 3 }}>
      <EmptyState
        icon={SearchOffRoundedIcon}
        title="Page not found"
        description="That route doesn't exist. Head back to your dashboard to pick up where you left off."
        actionLabel="Go to dashboard"
        onAction={() => navigate('/dashboard')}
      />
    </Box>
  );
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) return <FullScreenLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
};

// Sends already-authenticated drivers straight to work.
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMe());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <>
      {isAuthenticated && <LocationTracker />}
      <Routes>
      {/* Public auth routes */}
      <Route
        element={
          <PublicRoute>
            <AuthLayout />
          </PublicRoute>
        }
      >
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Route>

      {/* Protected app routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="/deliveries"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Deliveries />
            </Suspense>
          }
        />
        <Route
          path="/deliveries/:id"
          element={
            <Suspense fallback={<RouteFallback />}>
              <DeliveryDetail />
            </Suspense>
          }
        />
        <Route
          path="/map"
          element={
            <Suspense fallback={<RouteFallback />}>
              <LiveMap />
            </Suspense>
          }
        />
        <Route
          path="/history"
          element={
            <Suspense fallback={<RouteFallback />}>
              <History />
            </Suspense>
          }
        />
        <Route
          path="/earnings"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Earnings />
            </Suspense>
          }
        />
        <Route
          path="/profile"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Profile />
            </Suspense>
          }
        />
        <Route
          path="/notifications"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Notifications />
            </Suspense>
          }
        />
        <Route
          path="/settings"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Settings />
            </Suspense>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
    </>
  );
};

export default AppRoutes;
