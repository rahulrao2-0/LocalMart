import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './theme';

import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import ProductsList from './pages/Products/ProductsList';
import OrdersList from './pages/Orders/OrdersList';
import Profile from './pages/Profile/Profile';
import Notifications from './pages/Notifications/Notifications';

const THEME_STORAGE_KEY = 'localmart.seller.themeMode';

/** Stored choice wins; otherwise follow the OS. */
const getInitialThemeMode = () => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // localStorage can throw in private-browsing / blocked-cookie contexts
  }
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

function App() {
  const [themeMode, setThemeMode] = useState(getInitialThemeMode);
  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  // Persist so the choice survives a refresh.
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch {
      // ignore — persistence is a nicety, not a requirement
    }
  }, [themeMode]);

  // Explicitly ask for location permissions on app startup
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Seller location granted:", position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("Seller location permission denied or failed:", error.message);
        }
      );
    }
  }, []);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/dashboard" element={
            <PrivateRoute>
              <DashboardLayout themeMode={themeMode} toggleTheme={toggleTheme} />
            </PrivateRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductsList />} />
            <Route path="orders" element={<OrdersList />} />
            <Route path="order" element={<OrdersList />} />
            <Route path="profile" element={<Profile />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
