import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMe } from '../redux/features/authSlice';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';

// Auth Pages
import Login from '../pages/Auth/Login';
import Signup from '../pages/Auth/Signup';
import VerifyOtp from '../pages/Auth/VerifyOtp';

// Placeholder for other pages to be implemented
import Dashboard from '../pages/Dashboard/Dashboard';
import Deliveries from '../pages/Deliveries/Deliveries';
import History from '../pages/History/History';
import Earnings from '../pages/Earnings/Earnings';
import Profile from '../pages/Profile/Profile';
import Notifications from '../pages/Notifications/Notifications';
import Settings from '../pages/Settings/Settings';
const NotFound = () => <div>404 Not Found</div>;

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  
  if (loading) return <div>Loading...</div>; // Could use a Skeleton or Spinner
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route Component (Redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
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
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        {/* Redirect root to login if not authenticated */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Route>

      {/* Protected Main Routes */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/deliveries" element={<Deliveries />} />
        <Route path="/deliveries/:id" element={<Deliveries />} />
        <Route path="/history" element={<History />} />
        <Route path="/earnings" element={<Earnings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;
