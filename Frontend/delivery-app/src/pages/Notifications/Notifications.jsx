import React, { useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemAvatar, Avatar, ListItemText, IconButton, Button, Chip } from '@mui/material';
import { Notifications as NotificationsIcon, LocalShipping, Payment, Delete, CheckCircle } from '@mui/icons-material';

const initialNotifications = [
  { id: 1, title: 'New Delivery Assigned', message: 'You have a new delivery request from Sarah Jenkins.', time: '10 mins ago', type: 'delivery', read: false },
  { id: 2, title: 'Payment Successful', message: 'Your weekly settlement of $840.20 has been processed.', time: '2 hours ago', type: 'payment', read: false },
  { id: 3, title: 'Delivery Completed', message: 'Order DEL-1090 was successfully delivered.', time: '1 day ago', type: 'success', read: true },
];

const Notifications = () => {
  const [notifications, setNotifications] = useState(initialNotifications);

  const getIcon = (type) => {
    switch (type) {
      case 'delivery': return <LocalShipping />;
      case 'payment': return <Payment />;
      case 'success': return <CheckCircle />;
      default: return <NotificationsIcon />;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'delivery': return 'info';
      case 'payment': return 'primary';
      case 'success': return 'success';
      default: return 'default';
    }
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Notifications
        </Typography>
        <Button variant="outlined" onClick={markAllRead}>Mark All as Read</Button>
      </Box>

      <Paper sx={{ borderRadius: 3, boxShadow: 2, overflow: 'hidden' }}>
        <List disablePadding>
          {notifications.length === 0 ? (
            <Box p={4} textAlign="center">
              <Typography color="text.secondary">No new notifications.</Typography>
            </Box>
          ) : (
            notifications.map((notif, index) => (
              <Box key={notif.id} sx={{ bgcolor: notif.read ? 'transparent' : 'action.hover', borderBottom: index !== notifications.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                <ListItem
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => removeNotification(notif.id)} color="error">
                      <Delete />
                    </IconButton>
                  }
                  sx={{ p: 3 }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: `${getColor(notif.type)}.100`, color: `${getColor(notif.type)}.main` }}>
                      {getIcon(notif.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1" fontWeight={notif.read ? 'normal' : 'bold'}>
                          {notif.title}
                        </Typography>
                        {!notif.read && <Chip label="New" color="error" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />}
                      </Box>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography component="span" variant="body2" color="text.primary">
                          {notif.message}
                        </Typography>
                        <br />
                        <Typography component="span" variant="caption" color="text.secondary">
                          {notif.time}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                </ListItem>
              </Box>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default Notifications;
