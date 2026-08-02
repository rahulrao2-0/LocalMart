import React from 'react';
import { Grid, Typography, Box, Card, CardContent, Avatar, Paper, Chip, IconButton, Button } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const StatCard = ({ title, value, icon, color, trend }) => (
  <Card 
    sx={{ 
      height: '100%', 
      position: 'relative', 
      overflow: 'hidden',
      borderRadius: 4,
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      border: '1px solid',
      borderColor: 'grey.100',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 28px rgba(0,0,0,0.08)',
      }
    }}
  >
    <Box sx={{
      position: 'absolute',
      right: -20,
      top: -20,
      width: 120,
      height: 120,
      borderRadius: '50%',
      backgroundColor: `${color}15`,
      zIndex: 0,
      transition: 'transform 0.3s ease',
      '.MuiCard-root:hover &': {
        transform: 'scale(1.2)'
      }
    }} />
    <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Avatar sx={{ bgcolor: `${color}20`, color: color, width: 48, height: 48, borderRadius: 3 }}>
          {icon}
        </Avatar>
        <Box 
          sx={{ 
            bgcolor: trend.startsWith('+') ? 'success.50' : 'error.50',
            color: trend.startsWith('+') ? 'success.main' : 'error.main',
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            fontSize: '0.75rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}
        >
          {trend.startsWith('+') ? '↑' : '↓'} {trend.replace(/[+-]/, '')}
        </Box>
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: -1 }}>
          {value}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const recentOrders = [
  { id: '#ORD-7829', customer: 'Alice Cooper', amount: 120.50, status: 'Processing', date: 'Just now' },
  { id: '#ORD-7828', customer: 'Marcus Levin', amount: 84.00, status: 'Shipped', date: '2 hours ago' },
  { id: '#ORD-7827', customer: 'Sarah Jenkins', amount: 210.25, status: 'Delivered', date: '5 hours ago' },
  { id: '#ORD-7826', customer: 'David Smith', amount: 45.90, status: 'Processing', date: '1 day ago' },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'Processing': return 'warning';
    case 'Shipped': return 'info';
    case 'Delivered': return 'success';
    default: return 'default';
  }
};

const Dashboard = () => {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', month: 'long', day: 'numeric' 
  });

  return (
    <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
            Store Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {currentDate} • Here's what's happening with your store today.
          </Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<ShoppingBagIcon />} sx={{ borderRadius: 2, px: 3, py: 1.5, fontWeight: 'bold' }}>
          Add New Product
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Total Sales" 
            value="$12,450" 
            icon={<AccountBalanceWalletIcon />} 
            color="#10B981" 
            trend="+14.5%"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Active Orders" 
            value="45" 
            icon={<LocalShippingIcon />} 
            color="#2B3467" 
            trend="+5.2%"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Total Products" 
            value="128" 
            icon={<Inventory2Icon />} 
            color="#EB455F" 
            trend="+12.0%"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Low Stock" 
            value="3" 
            icon={<WarningAmberIcon />} 
            color="#F59E0B" 
            trend="-2.1%"
          />
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        {/* Sales Analytics Overview (MUI Native) */}
        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
          <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', height: '100%', border: '1px solid', borderColor: 'grey.100', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Sales Performance</Typography>
              <Typography variant="subtitle2" color="primary" sx={{ cursor: 'pointer', fontWeight: 'bold' }}>
                View Full Report
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexGrow: 1, flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4, mb: 5 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Revenue This Week</Typography>
                  <Typography variant="h3" color="primary.main" sx={{ fontWeight: 900, letterSpacing: -1 }}>$4,280.50</Typography>
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 'bold' }}>+18% from last week</Typography>
                </Box>
                <Box sx={{ borderLeft: { sm: '1px solid #eee' }, pl: { sm: 4 } }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Orders This Week</Typography>
                  <Typography variant="h3" color="text.primary" sx={{ fontWeight: 900, letterSpacing: -1 }}>142</Typography>
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 'bold' }}>+5% from last week</Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Monthly Sales Target ($20,000)</Typography>
                  <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold' }}>62%</Typography>
                </Box>
                <Box sx={{ width: '100%', height: 12, bgcolor: 'grey.100', borderRadius: 6, overflow: 'hidden' }}>
                  <Box sx={{ width: '62%', height: '100%', bgcolor: 'primary.main', borderRadius: 6, transition: 'width 1s ease-in-out' }} />
                </Box>
              </Box>
              
              <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'success.50', borderRadius: 3 }}>
                <Box sx={{ bgcolor: 'success.100', p: 1, borderRadius: 2, display: 'flex', color: 'success.main' }}>
                  <TrendingUpIcon />
                </Box>
                <Box>
                  <Typography variant="body2" color="success.dark" sx={{ fontWeight: 'bold' }}>
                    Store is performing exceptionally well!
                  </Typography>
                  <Typography variant="caption" color="success.dark">
                    You are on track to beat your highest sales month.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Recent Orders List */}
        <Grid size={{ xs: 12, md: 5, lg: 4 }}>
          <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', height: '100%', border: '1px solid', borderColor: 'grey.100' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Recent Orders</Typography>
              <IconButton size="small"><MoreVertIcon /></IconButton>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentOrders.map((order) => (
                <Box 
                  key={order.id} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 2, 
                    borderRadius: 3, 
                    bgcolor: 'grey.50',
                    transition: '0.2s',
                    '&:hover': { bgcolor: 'grey.100', transform: 'translateX(4px)' }
                  }}
                >
                  <Avatar sx={{ bgcolor: `${getStatusColor(order.status)}.100`, color: `${getStatusColor(order.status)}.main`, mr: 2, width: 44, height: 44, fontWeight: 'bold' }}>
                    {order.customer.charAt(0)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 'bold' }}>
                      {order.customer}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
                      {order.id} • {order.date}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 'bold' }}>
                      ${order.amount.toFixed(2)}
                    </Typography>
                    <Chip 
                      size="small" 
                      label={order.status} 
                      color={getStatusColor(order.status)}
                      sx={{ height: 22, fontSize: '0.65rem', mt: 0.5, fontWeight: 'bold', borderRadius: 1 }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
            
            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'grey.100', textAlign: 'center' }}>
              <Typography variant="body2" color="primary.main" sx={{ cursor: 'pointer', fontWeight: 'bold', '&:hover': { textDecoration: 'underline' } }}>
                View All Orders
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
