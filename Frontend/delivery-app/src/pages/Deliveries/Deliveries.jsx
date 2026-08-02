import React, { useState } from 'react';
import { 
  Box, Typography, Card, CardContent, Chip, Button, Grid, Avatar, 
  Tabs, Tab, IconButton, Divider 
} from '@mui/material';
import { 
  LocalShipping, Navigation, Phone, Directions, CheckCircle, Cancel 
} from '@mui/icons-material';

const mockDeliveries = [
  { id: 'DEL-2041', status: 'Assigned', customer: 'Sarah Jenkins', address: '456 Oak St, Apt 2B', phone: '+1 234-567-8901', distance: '2.5 km', amount: 12.50 },
  { id: 'DEL-2042', status: 'Accepted', customer: 'Michael Chen', address: '789 Pine Ave', phone: '+1 987-654-3210', distance: '1.2 km', amount: 8.00 },
  { id: 'DEL-2043', status: 'Picked Up', customer: 'Emily Rogers', address: '101 Maple Dr', phone: '+1 555-123-4567', distance: '4.0 km', amount: 15.75 },
];

const DeliveryCard = ({ delivery }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'Assigned': return 'info';
      case 'Accepted': return 'primary';
      case 'Picked Up': return 'warning';
      case 'Out For Delivery': return 'secondary';
      case 'Delivered': return 'success';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ mb: 2, borderRadius: 3, boxShadow: 2, transition: '0.3s', '&:hover': { boxShadow: 4 } }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
              <LocalShipping />
            </Avatar>
            <Typography variant="h6" fontWeight="bold">
              {delivery.id}
            </Typography>
          </Box>
          <Chip label={delivery.status} color={getStatusColor(delivery.status)} size="small" sx={{ fontWeight: 'bold' }} />
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <Typography variant="subtitle2" color="text.secondary">Customer</Typography>
            <Typography variant="body1" fontWeight="500">{delivery.customer}</Typography>
            
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Delivery Address</Typography>
            <Typography variant="body2">{delivery.address}</Typography>
            
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Distance</Typography>
            <Typography variant="body2">{delivery.distance}</Typography>
          </Grid>
          <Grid item xs={12} sm={4} display="flex" flexDirection="column" alignItems={{ xs: 'flex-start', sm: 'flex-end' }}>
            <Typography variant="subtitle2" color="text.secondary">Earning</Typography>
            <Typography variant="h5" color="primary.main" fontWeight="bold">${delivery.amount.toFixed(2)}</Typography>
            
            <Box display="flex" gap={1} mt={2}>
              <IconButton color="primary" size="small" sx={{ bgcolor: 'primary.50' }}>
                <Phone fontSize="small" />
              </IconButton>
              <IconButton color="secondary" size="small" sx={{ bgcolor: 'secondary.50' }}>
                <Directions fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
        
        <Box mt={3} display="flex" gap={2}>
          {delivery.status === 'Assigned' && (
            <>
              <Button variant="contained" color="primary" fullWidth startIcon={<CheckCircle />}>Accept</Button>
              <Button variant="outlined" color="error" fullWidth startIcon={<Cancel />}>Reject</Button>
            </>
          )}
          {delivery.status === 'Accepted' && (
            <Button variant="contained" color="warning" fullWidth>Mark as Picked Up</Button>
          )}
          {delivery.status === 'Picked Up' && (
            <Button variant="contained" color="secondary" fullWidth startIcon={<Navigation />}>Start Navigation</Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

const Deliveries = () => {
  const [tabIndex, setTabIndex] = useState(0);
  
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const filterDeliveries = (statusArray) => {
    return mockDeliveries.filter(d => statusArray.includes(d.status));
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Active Deliveries
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabIndex} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="New Requests" />
          <Tab label="Accepted" />
          <Tab label="In Transit" />
        </Tabs>
      </Box>

      <Box>
        {tabIndex === 0 && (
          filterDeliveries(['Assigned']).length > 0 
            ? filterDeliveries(['Assigned']).map(d => <DeliveryCard key={d.id} delivery={d} />)
            : <Typography color="text.secondary">No new delivery requests.</Typography>
        )}
        {tabIndex === 1 && (
          filterDeliveries(['Accepted']).length > 0 
            ? filterDeliveries(['Accepted']).map(d => <DeliveryCard key={d.id} delivery={d} />)
            : <Typography color="text.secondary">No accepted deliveries right now.</Typography>
        )}
        {tabIndex === 2 && (
          filterDeliveries(['Picked Up', 'Out For Delivery']).length > 0 
            ? filterDeliveries(['Picked Up', 'Out For Delivery']).map(d => <DeliveryCard key={d.id} delivery={d} />)
            : <Typography color="text.secondary">No deliveries currently in transit.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default Deliveries;
