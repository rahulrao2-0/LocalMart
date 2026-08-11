import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Grid, Typography, Box, Card, CardContent, Avatar, 
  Paper, Chip, IconButton, Button, useTheme, alpha, CircularProgress 
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';
import { fetchOrders } from '../../features/orders/orderSlice';

const StatCard = ({ title, value, icon, gradient, trend, trendValue }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        position: 'relative', 
        overflow: 'hidden',
        borderRadius: 4,
        background: isDark 
          ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`
          : `linear-gradient(135deg, ${alpha('#ffffff', 0.9)} 0%, ${alpha('#f8f9fa', 0.6)} 100%)`,
        backdropFilter: 'blur(20px)',
        border: '1px solid',
        borderColor: isDark ? alpha(theme.palette.common.white, 0.1) : alpha(theme.palette.common.white, 0.8),
        boxShadow: isDark 
          ? '0 8px 32px rgba(0,0,0,0.3)'
          : '0 8px 32px rgba(31,38,135,0.07)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: isDark 
            ? '0 12px 40px rgba(0,0,0,0.4)'
            : '0 12px 40px rgba(31,38,135,0.12)',
        }
      }}
    >
      <Box sx={{
        position: 'absolute',
        right: -30,
        top: -30,
        width: 150,
        height: 150,
        borderRadius: '50%',
        background: gradient,
        opacity: 0.15,
        zIndex: 0,
        transition: 'transform 0.3s ease',
        '.MuiCard-root:hover &': {
          transform: 'scale(1.2)'
        }
      }} />
      <CardContent sx={{ position: 'relative', zIndex: 1, p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: -0.5 }}>
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ 
            background: gradient, 
            color: 'white', 
            width: 56, 
            height: 56, 
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            {icon}
          </Avatar>
        </Box>
        <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              bgcolor: trend === 'up' ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
              color: trend === 'up' ? theme.palette.success.main : theme.palette.error.main,
              px: 1,
              py: 0.5,
              borderRadius: 2,
            }}
          >
            {trend === 'up' ? <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }}/> : <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }}/>}
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {trendValue}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            vs last month
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'PENDING':
    case 'PROCESSING': return 'warning';
    case 'CONFIRMED':
    case 'SHIPPED':
    case 'OUT_FOR_DELIVERY': return 'info';
    case 'DELIVERED': return 'success';
    case 'CANCELLED': return 'error';
    default: return 'default';
  }
};

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isDark = theme.palette.mode === 'dark';

  const { user } = useSelector((state) => state.auth);
  const { items: orders = [], loading: ordersLoading } = useSelector((state) => state.orders);

  const sellerId = user?.id || user?._id || user?.sellerId || "seller-001";

  useEffect(() => {
    if (sellerId) {
      dispatch(fetchOrders(sellerId));
    }
  }, [dispatch, sellerId]);

  // Calculate dynamic stats
  const totalRevenue = orders.reduce((sum, order) => {
    if (order.orderStatus !== 'CANCELLED' && (order.paymentStatus === 'COMPLETED' || order.orderStatus === 'CONFIRMED' || order.orderStatus === 'DELIVERED')) {
      return sum + (Number(order.totalAmount) || 0);
    }
    return sum;
  }, 0);

  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'PENDING' || o.orderStatus === 'PROCESSING').length;

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', month: 'long', day: 'numeric' 
  });

  const glassStyle = {
    background: isDark 
      ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`
      : `linear-gradient(135deg, ${alpha('#ffffff', 0.9)} 0%, ${alpha('#f8f9fa', 0.6)} 100%)`,
    backdropFilter: 'blur(20px)',
    border: '1px solid',
    borderColor: isDark ? alpha(theme.palette.common.white, 0.1) : alpha(theme.palette.common.white, 0.8),
    boxShadow: isDark 
      ? '0 8px 32px rgba(0,0,0,0.3)'
      : '0 8px 32px rgba(31,38,135,0.07)',
    borderRadius: 4,
  };

  return (
    <Box sx={{ maxWidth: '1400px', mx: 'auto', p: { xs: 2, md: 3 } }}>
      
      {/* Hero Section */}
      <Box sx={{ 
        ...glassStyle,
        p: { xs: 3, md: 5 }, 
        mb: 4, 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', md: 'center' },
        gap: 3,
        background: isDark 
          ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.6)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`
          : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.2)} 0%, ${alpha('#ffffff', 0.9)} 100%)`,
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: 'text.primary' }}>
            Welcome back, Seller! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {currentDate} • Here's what's happening with your store today.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" color="primary" startIcon={<AddIcon />} sx={{ borderRadius: 2, px: 3, py: 1, fontWeight: 'bold' }}>
              Add Product
            </Button>
            <Button variant="outlined" color="primary" sx={{ borderRadius: 2, px: 3, py: 1, fontWeight: 'bold' }}>
              View Reports
            </Button>
          </Box>
        </Box>
        <Box sx={{ 
          display: { xs: 'none', md: 'block' },
          p: 2,
          borderRadius: '50%',
          bgcolor: alpha(theme.palette.primary.main, 0.1)
        }}>
          <ShoppingBagIcon sx={{ fontSize: 80, color: theme.palette.primary.main }} />
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Revenue" 
            value={`₹${totalRevenue.toLocaleString()}`} 
            icon={<AccountBalanceWalletIcon />} 
            gradient="linear-gradient(135deg, #10B981 0%, #059669 100%)" 
            trend="up"
            trendValue="12.5%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Pending Orders" 
            value={pendingOrdersCount.toString()} 
            icon={<LocalShippingIcon />} 
            gradient="linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)" 
            trend="up"
            trendValue="5.2%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Orders" 
            value={orders.length.toString()} 
            icon={<Inventory2Icon />} 
            gradient="linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)" 
            trend="up"
            trendValue="8.0%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Low Stock" 
            value="3" 
            icon={<WarningAmberIcon />} 
            gradient="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" 
            trend="down"
            trendValue="2.1%"
          />
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        {/* Modern Chart Area Placeholder */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ ...glassStyle, p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Revenue Overview</Typography>
              <Chip label="This Week" variant="outlined" size="small" sx={{ fontWeight: 'bold' }} />
            </Box>
            
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', pt: 4, gap: 1 }}>
              {/* Simple Bar Chart Representation using MUI Boxes */}
              {[40, 70, 45, 90, 65, 85, 100].map((height, index) => (
                <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: 1 }}>
                  <Box 
                    sx={{ 
                      width: { xs: 20, sm: 30, md: 40 }, 
                      height: `${height * 2.5}px`, 
                      background: index === 6 
                        ? `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.2)} 100%)`
                        : `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.4)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                      borderRadius: '8px 8px 0 0',
                      transition: 'height 0.5s ease',
                      '&:hover': {
                        background: `linear-gradient(180deg, ${theme.palette.primary.light} 0%, ${alpha(theme.palette.primary.main, 0.2)} 100%)`,
                      }
                    }} 
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
        
        {/* Recent Orders List */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ ...glassStyle, p: 4, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Recent Orders</Typography>
              <IconButton size="small" onClick={() => navigate('/orders')}><MoreVertIcon /></IconButton>
            </Box>
            
            {ordersLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress size={32} />
              </Box>
            ) : orders.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">No orders received yet.</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {orders.slice(0, 5).map((order) => {
                  const orderNum = order.orderNumber || `#${(order._id || order.id || '').substring(0, 8).toUpperCase()}`;
                  const amount = Number(order.totalAmount || 0);
                  const statusStr = order.orderStatus || order.status || 'PENDING';
                  const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently';
                  const customerName = order.customer?.name || order.customer?.fullName || order.shippingAddress?.fullName || order.shippingAddress?.name || order.customerName || 'Customer';

                  return (
                    <Box 
                      key={order._id || order.id} 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        p: 2, 
                        borderRadius: 3, 
                        bgcolor: isDark ? alpha(theme.palette.common.white, 0.05) : alpha('#000', 0.02),
                        border: '1px solid',
                        borderColor: isDark ? alpha(theme.palette.common.white, 0.05) : alpha('#000', 0.03),
                        transition: 'all 0.2s ease',
                        '&:hover': { 
                          bgcolor: isDark ? alpha(theme.palette.common.white, 0.1) : alpha('#000', 0.04), 
                          transform: 'translateX(4px)' 
                        }
                      }}
                    >
                      <Avatar sx={{ 
                        bgcolor: alpha(theme.palette[getStatusColor(statusStr)]?.main || theme.palette.primary.main, 0.15), 
                        color: theme.palette[getStatusColor(statusStr)]?.main || theme.palette.primary.main, 
                        mr: 2, 
                        width: 44, 
                        height: 44, 
                        fontWeight: 'bold' 
                      }}>
                        {customerName.charAt(0)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 700 }}>
                          {customerName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
                          {orderNum} • {dateStr}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                          ₹{amount.toFixed(2)}
                        </Typography>
                        <Chip 
                          size="small" 
                          label={statusStr} 
                          color={getStatusColor(statusStr)}
                          variant={isDark ? "outlined" : "filled"}
                          sx={{ height: 22, fontSize: '0.65rem', mt: 0.5, fontWeight: 'bold', borderRadius: 1 }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
            
            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: isDark ? alpha(theme.palette.common.white, 0.1) : alpha('#000', 0.1), textAlign: 'center' }}>
              <Button color="primary" onClick={() => navigate('/orders')} sx={{ fontWeight: 'bold', textTransform: 'none' }}>
                View All Orders
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
