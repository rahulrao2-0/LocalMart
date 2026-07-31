import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Paper, Divider } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: 'New Order Received',
    message: 'Order #1023 was placed just now.',
    time: '5 mins ago',
    type: 'order'
  },
  {
    id: 2,
    title: 'Low Stock Alert',
    message: 'Product "Organic Apples" is running low on stock.',
    time: '2 hours ago',
    type: 'inventory'
  },
  {
    id: 3,
    title: 'System Update',
    message: 'Seller dashboard will be under maintenance tonight.',
    time: '1 day ago',
    type: 'system'
  }
];

const Notifications = () => {
  const getIcon = (type) => {
    switch(type) {
      case 'order': return <ShoppingCartIcon />;
      case 'inventory': return <InventoryIcon />;
      default: return <NotificationsIcon />;
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Notifications</Typography>
      
      <Paper>
        <List>
          {MOCK_NOTIFICATIONS.map((notif, index) => (
            <React.Fragment key={notif.id}>
              <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: notif.type === 'order' ? '#4caf50' : notif.type === 'inventory' ? '#ff9800' : '#2196f3' }}>
                    {getIcon(notif.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={notif.title}
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
              {index < MOCK_NOTIFICATIONS.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default Notifications;
