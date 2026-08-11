import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { 
  Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Paper, Divider, 
  Button, IconButton, Chip, Stack, CircularProgress, Alert, Tooltip, Tabs, Tab, alpha, useTheme
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/NotificationsRounded';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCartRounded';
import InventoryIcon from '@mui/icons-material/Inventory2Rounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircleRounded';
import CancelIcon from '@mui/icons-material/CancelRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineRounded';
import DoneAllIcon from '@mui/icons-material/DoneAllRounded';
import RefreshIcon from '@mui/icons-material/RefreshRounded';
import LocalShippingIcon from '@mui/icons-material/LocalShippingRounded';

export default function Notifications() {
  const theme = useTheme();
  const { user, token } = useSelector((state) => state.auth);
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0); // 0 = All, 1 = Unread

  const userId = user?.id || user?._id || user?.sellerId || "seller-001";

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = {};
      if (token && token !== "undefined" && token !== "null") {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const unreadParam = tabValue === 1 ? "&unreadOnly=true" : "";
      const res = await fetch(`http://localhost:3000/api/v1/notifications?userId=${userId}${unreadParam}`, {
        credentials: 'include',
        headers
      });
      const data = await res.json();
      if (data && data.success) {
        setNotifications(data.data || []);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, tabValue]);

  useEffect(() => {
    if (!userId) return;

    const socket = io('http://localhost:5003');
    socket.on('connect', () => {
      socket.emit('join', userId);
    });

    socket.on('notification', (newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
    });

    return () => socket.disconnect();
  }, [userId]);

  const handleMarkAsRead = async (id) => {
    try {
      const headers = {};
      if (token && token !== "undefined" && token !== "null") {
        headers["Authorization"] = `Bearer ${token}`;
      }

      await fetch(`http://localhost:3000/api/v1/notifications/${id}/read?userId=${userId}`, {
        method: 'PUT',
        credentials: 'include',
        headers
      });

      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const headers = {};
      if (token && token !== "undefined" && token !== "null") {
        headers["Authorization"] = `Bearer ${token}`;
      }

      await fetch(`http://localhost:3000/api/v1/notifications/read-all?userId=${userId}`, {
        method: 'PUT',
        credentials: 'include',
        headers
      });

      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      const headers = {};
      if (token && token !== "undefined" && token !== "null") {
        headers["Authorization"] = `Bearer ${token}`;
      }

      await fetch(`http://localhost:3000/api/v1/notifications/${id}?userId=${userId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers
      });

      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const handleDeleteAll = async () => {
    try {
      const headers = {};
      if (token && token !== "undefined" && token !== "null") {
        headers["Authorization"] = `Bearer ${token}`;
      }

      await fetch(`http://localhost:3000/api/v1/notifications?userId=${userId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers
      });

      setNotifications([]);
    } catch (err) {
      console.error("Error deleting all notifications:", err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ORDER_CREATED':
        return <ShoppingCartIcon />;
      case 'ORDER_CONFIRMED':
        return <CheckCircleIcon />;
      case 'ORDER_CANCELLED':
      case 'PAYMENT_FAILED':
        return <CancelIcon />;
      case 'DELIVERY_ASSIGNED':
      case 'ORDER_STATUS_UPDATED':
        return <LocalShippingIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'ORDER_CREATED':
        return theme.palette.warning.main;
      case 'ORDER_CONFIRMED':
        return theme.palette.success.main;
      case 'ORDER_CANCELLED':
      case 'PAYMENT_FAILED':
        return theme.palette.error.main;
      case 'ORDER_STATUS_UPDATED':
      case 'DELIVERY_ASSIGNED':
        return theme.palette.info.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="text.primary">
            Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Stay updated with live order events, buyer activities, and system alerts
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <IconButton onClick={fetchNotifications} title="Refresh Notifications" color="primary">
            <RefreshIcon />
          </IconButton>
          {unreadCount > 0 && (
            <Button 
              size="small" 
              variant="outlined" 
              startIcon={<DoneAllIcon />}
              onClick={handleMarkAllAsRead}
              sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none' }}
            >
              Mark All Read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button 
              size="small" 
              variant="text" 
              color="error"
              startIcon={<DeleteOutlineIcon />}
              onClick={handleDeleteAll}
              sx={{ fontWeight: 700, textTransform: 'none' }}
            >
              Clear All
            </Button>
          )}
        </Stack>
      </Stack>

      <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'grey.100' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, bgcolor: 'grey.50' }}>
          <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} indicatorColor="primary" textColor="primary">
            <Tab label="All Notifications" sx={{ fontWeight: 700, textTransform: 'none' }} />
            <Tab 
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <span>Unread</span>
                  {unreadCount > 0 && (
                    <Chip label={unreadCount} size="small" color="error" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 800 }} />
                  )}
                </Stack>
              } 
              sx={{ fontWeight: 700, textTransform: 'none' }} 
            />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={36} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 3, borderRadius: 3 }}>
            {error}
          </Alert>
        ) : notifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
            <NotificationsIcon sx={{ fontSize: 56, color: 'text.disabled', opacity: 0.5, mb: 1 }} />
            <Typography variant="h6" fontWeight={700} color="text.secondary">
              No Notifications
            </Typography>
            <Typography variant="body2" color="text.disabled">
              {tabValue === 1 ? "You have no unread notifications." : "You're all caught up! New order updates will appear here."}
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {notifications.map((notif, index) => {
              const iconColor = getNotificationColor(notif.type);

              return (
                <React.Fragment key={notif._id || index}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      py: 2,
                      px: 3,
                      bgcolor: notif.isRead ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                    }}
                    secondaryAction={
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        {!notif.isRead && (
                          <Tooltip title="Mark as read">
                            <IconButton size="small" color="primary" onClick={() => handleMarkAsRead(notif._id)}>
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton size="small" color="default" onClick={() => handleDeleteNotification(notif._id)}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: alpha(iconColor, 0.15), color: iconColor, borderRadius: 2.5 }}>
                        {getNotificationIcon(notif.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                          <Typography variant="subtitle2" fontWeight={notif.isRead ? 600 : 800} color="text.primary">
                            {notif.title}
                          </Typography>
                          {!notif.isRead && (
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                          )}
                        </Stack>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography component="span" variant="body2" color="text.secondary" display="block">
                            {notif.message}
                          </Typography>
                          <Typography component="span" variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                            {notif.createdAt ? new Date(notif.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recently"}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && <Divider component="li" />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Paper>
    </Box>
  );
}
