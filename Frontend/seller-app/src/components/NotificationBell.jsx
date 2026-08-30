import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import {
  IconButton, Badge, Menu, Typography, Box, Divider, Button, Tooltip, Avatar, alpha, useTheme,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/NotificationsRounded';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOffRounded';

export default function NotificationBell() {
  const theme = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (!user) return;
    const userId = user.id || user._id;
    if (!userId) return;

    const fetchNotifications = async () => {
      try {
        const headers = {};
        if (token && token !== "undefined" && token !== "null") {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`http://localhost:3000/api/v1/notifications?userId=${userId}&unreadOnly=true`, {
          credentials: 'include',
          headers
        });
        const data = await res.json();
        if (data && data.success) {
          setNotifications(data.data || []);
        }

        const countRes = await fetch(`http://localhost:3000/api/v1/notifications/unread?userId=${userId}`, {
          credentials: 'include',
          headers
        });
        const countData = await countRes.json();
        if (countData && countData.success) {
          setUnreadCount(countData.count || 0);
        }
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };

    fetchNotifications();

    const socket = io('http://localhost:3009');
    socket.on('connect', () => {
      socket.emit('join', userId);
    });

    socket.on('notification', (newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => socket.disconnect();
  }, [user, token]);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const markAllAsRead = async () => {
    try {
      const userId = user?.id || user?._id;
      const headers = {};
      if (token && token !== "undefined" && token !== "null") {
        headers["Authorization"] = `Bearer ${token}`;
      }

      await fetch(`http://localhost:3000/api/v1/notifications/read-all?userId=${userId}`, {
        method: 'PUT',
        credentials: 'include',
        headers
      });
      setUnreadCount(0);
      setNotifications([]);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          onClick={handleOpen}
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
          sx={{
            color: 'text.secondary',
            '&:hover': { color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.08) },
          }}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            max={99}
            slotProps={{ badge: { sx: { fontWeight: 800, fontSize: '0.65rem' } } }}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: {
              // Never wider than the viewport on a 360px phone. The previous
              // fixed `width: 340` was passed via PaperProps, which MUI v9
              // removed, so it had no effect at all.
              width: 'min(360px, calc(100vw - 24px))',
              maxHeight: 'min(440px, calc(100vh - 100px))',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1.5,
            flexShrink: 0,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            Notifications
            {unreadCount > 0 && (
              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.75, fontWeight: 600 }}>
                {unreadCount} new
              </Typography>
            )}
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={markAllAsRead} sx={{ fontWeight: 700, flexShrink: 0 }}>
              Clear all
            </Button>
          )}
        </Box>

        <Divider sx={{ flexShrink: 0 }} />

        <Box sx={{ overflowY: 'auto', flex: 1 }}>
          {notifications.length === 0 ? (
            <Box sx={{ px: 3, py: 4, textAlign: 'center' }}>
              <NotificationsOffIcon sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                You're all caught up
              </Typography>
              <Typography variant="caption" color="text.disabled">
                New order events will appear here.
              </Typography>
            </Box>
          ) : (
            notifications.map((notif) => (
              <Box
                key={notif._id}
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  px: 2,
                  py: 1.5,
                  borderLeft: '3px solid',
                  borderColor: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  transition: 'background-color .2s ease',
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
                  '& + &': { borderTop: `1px solid ${theme.palette.divider}` },
                }}
              >
                <Avatar
                  variant="rounded"
                  sx={{
                    width: 32,
                    height: 32,
                    flexShrink: 0,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                    color: 'primary.main',
                  }}
                >
                  <NotificationsIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.35 }}>
                    {notif.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, fontSize: '0.8rem' }}>
                    {notif.message}
                  </Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
                    {notif.createdAt
                      ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Just now'}
                  </Typography>
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Menu>
    </>
  );
}
