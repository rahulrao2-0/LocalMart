import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import {
  Box, Typography, Paper, Divider, Button, IconButton, Chip, Stack,
  Skeleton, Alert, Tooltip, Tabs, Tab, Avatar, alpha, useTheme,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/NotificationsRounded';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCartRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircleRounded';
import CancelIcon from '@mui/icons-material/CancelRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineRounded';
import DoneAllIcon from '@mui/icons-material/DoneAllRounded';
import RefreshIcon from '@mui/icons-material/RefreshRounded';
import LocalShippingIcon from '@mui/icons-material/LocalShippingRounded';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';

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

    const socket = io('http://localhost:3009');
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
      <PageHeader
        title="Notifications"
        subtitle="Stay updated with live order events, buyer activity, and system alerts."
        actions={
          <>
            <Tooltip title="Refresh notifications">
              <IconButton
                onClick={fetchNotifications}
                color="primary"
                sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), flexShrink: 0 }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            {unreadCount > 0 && (
              <Button variant="outlined" startIcon={<DoneAllIcon />} onClick={handleMarkAllAsRead}>
                Mark All Read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button color="error" startIcon={<DeleteOutlineIcon />} onClick={handleDeleteAll}>
                Clear All
              </Button>
            )}
          </>
        }
      />

      <Paper sx={{ overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ px: { xs: 1, sm: 2 }, bgcolor: 'background.subtle', borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Tabs
            value={tabValue}
            onChange={(_, val) => setTabValue(val)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab label="All Notifications" />
            <Tab
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <span>Unread</span>
                  {unreadCount > 0 && (
                    <Chip
                      label={unreadCount}
                      size="small"
                      color="error"
                      sx={{ height: 20, fontSize: '0.7rem', fontWeight: 800 }}
                    />
                  )}
                </Stack>
              }
            />
          </Tabs>
        </Box>

        {loading ? (
          <Stack spacing={0} divider={<Divider />}>
            {[...Array(4)].map((_, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 2, p: { xs: 2, sm: 2.5 } }}>
                <Skeleton variant="rounded" width={44} height={44} sx={{ flexShrink: 0, borderRadius: 2.5 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Skeleton width="40%" height={20} />
                  <Skeleton width="85%" height={18} />
                  <Skeleton width="25%" height={14} />
                </Box>
              </Box>
            ))}
          </Stack>
        ) : error ? (
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={fetchNotifications}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          </Box>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<NotificationsIcon />}
            title="No notifications"
            description={
              tabValue === 1
                ? 'You have no unread notifications.'
                : "You're all caught up! New order updates will appear here."
            }
          />
        ) : (
          <Stack divider={<Divider />}>
            {notifications.map((notif, index) => {
              const iconColor = getNotificationColor(notif.type);
              const unread = !notif.isRead;

              return (
                <Box
                  key={notif._id || index}
                  sx={{
                    display: 'flex',
                    gap: { xs: 1.5, sm: 2 },
                    p: { xs: 2, sm: 2.5 },
                    borderLeft: '3px solid',
                    borderLeftColor: unread ? 'primary.main' : 'transparent',
                    bgcolor: unread ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                    transition: 'background-color 0.2s ease',
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                  }}
                >
                  <Avatar
                    variant="rounded"
                    sx={{
                      width: 44,
                      height: 44,
                      flexShrink: 0,
                      borderRadius: 2.5,
                      bgcolor: alpha(iconColor, 0.15),
                      color: iconColor,
                    }}
                  >
                    {getNotificationIcon(notif.type)}
                  </Avatar>

                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: unread ? 800 : 600, lineHeight: 1.4 }}
                      >
                        {notif.title}
                      </Typography>
                      {unread && (
                        <Box
                          sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }}
                        />
                      )}
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      {notif.message}
                    </Typography>

                    {/* Actions sit in flow rather than in `secondaryAction`, which
                        is absolutely positioned and overlapped the message text
                        on narrow screens. */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                        mt: 0.75,
                      }}
                    >
                      <Typography variant="caption" color="text.disabled">
                        {notif.createdAt
                          ? new Date(notif.createdAt).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                          : "Recently"}
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                        {unread && (
                          <Tooltip title="Mark as read">
                            <IconButton size="small" color="primary" onClick={() => handleMarkAsRead(notif._id)}>
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteNotification(notif._id)}
                            sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
