import React, { useState, useMemo } from 'react';
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

function App() {
  const [themeMode, setThemeMode] = useState("light");
  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login themeMode={themeMode} />} />
          <Route path="/signup" element={<Signup themeMode={themeMode} />} />
          
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
