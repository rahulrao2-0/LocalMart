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
        const res = await fetch(`http://localhost:5003/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setNotifications(data.data);
        }
        
        const countRes = await fetch(`http://localhost:5003/api/notifications/unread`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const countData = await countRes.json();
        if (countData.success) {
          setUnreadCount(countData.count);
        }
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };
    
    fetchNotifications();

    const socket = io('http://localhost:5003');
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
      await fetch(`http://localhost:5003/api/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error(error);
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
          sx: { width: 320, maxHeight: 400, borderRadius: 3, mt: 1, boxShadow: '0px 10px 30px rgba(0,0,0,0.15)' }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={markAllAsRead} sx={{ textTransform: 'none' }}>
              Mark all as read
            </Button>
          )}
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">No notifications</Typography>
          </Box>
        ) : (
          notifications.map(notif => (
            <MenuItem key={notif._id} sx={{ whiteSpace: 'normal', bgcolor: notif.isRead ? 'transparent' : 'action.hover' }}>
              <Box>
                <Typography variant="subtitle2" fontWeight={notif.isRead ? 'normal' : 'bold'}>
                  {notif.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {notif.message}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
}
