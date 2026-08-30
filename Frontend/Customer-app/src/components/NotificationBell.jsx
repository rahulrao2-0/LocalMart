import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

export default function NotificationBell() {
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
      <IconButton onClick={handleOpen} sx={{ color: 'text.primary' }}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 340, maxHeight: 420, borderRadius: 3, mt: 1, boxShadow: '0px 10px 30px rgba(0,0,0,0.15)' }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">New Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={markAllAsRead} sx={{ textTransform: 'none', fontWeight: 700 }}>
              Clear All
            </Button>
          )}
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">No new notifications</Typography>
          </Box>
        ) : (
          notifications.map(notif => (
            <MenuItem key={notif._id} sx={{ whiteSpace: 'normal', bgcolor: 'action.hover', py: 1.5 }}>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                  {notif.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {notif.message}
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
}
