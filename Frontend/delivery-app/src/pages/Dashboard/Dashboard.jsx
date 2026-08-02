import React, { useEffect } from 'react';
import { Typography, Box, CircularProgress, Paper, Chip, Avatar, IconButton } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData } from '../../redux/features/dashboardSlice';
import StatCard from '../../components/StatCard';
import { 
  LocalShipping, 
  CheckCircle, 
  AttachMoney, 
  StarRate, 
  ChevronRight,
  LocationOn,
  TrendingUp
} from '@mui/icons-material';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats, recentDeliveries, loading } = useSelector((state) => state.dashboard);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  if (loading || !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={40} thickness={4} />
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'success';
      case 'Out For Delivery': return 'warning';
      case 'Pending': return 'info';
      default: return 'default';
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', month: 'long', day: 'numeric' 
  });

  return (
    <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h4" color="text.primary" gutterBottom sx={{ fontWeight: 800 }}>
            Welcome back, {user?.name ? user.name.split(' ')[0] : 'Driver'} 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {currentDate} • You have {stats.pendingDeliveries} pending deliveries today.
          </Typography>
        </Box>
        <Chip 
          icon={<Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main', ml: 1 }} />}
          label={`${stats.currentStatus} Status`}
          sx={{ bgcolor: 'success.50', color: 'success.dark', fontWeight: 'bold', borderRadius: 2, py: 2, px: 1 }} 
        />
      </Box>

      {/* Stats Cards Using CSS Grid for robust layout without MUI Grid bugs */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <StatCard 
          title="Today's Deliveries" 
          value={stats.todaysDeliveries} 
          icon={<LocalShipping fontSize="large" />} 
          color="#FF9800"
          trend="up"
          trendValue="12%"
        />
        <StatCard 
          title="Completed" 
          value={stats.completedDeliveries} 
          icon={<CheckCircle fontSize="large" />} 
          color="#4CAF50"
          subtitle={`${stats.pendingDeliveries} remaining to goal`}
        />
        <StatCard 
          title="Today's Earnings" 
          value={`$${stats.todaysEarnings.toFixed(2)}`} 
          icon={<AttachMoney fontSize="large" />} 
          color="#2196F3"
          trend="up"
          trendValue="5%"
        />
        <StatCard 
          title="Average Rating" 
          value={stats.averageRating} 
          icon={<StarRate fontSize="large" />} 
          color="#FFC107"
          subtitle="Based on 142 reviews"
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        {/* Earnings Overview */}
        <Paper sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', height: '100%', border: '1px solid', borderColor: 'grey.100' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Earnings Overview</Typography>
            <Typography variant="subtitle2" color="primary" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
              View Report
            </Typography>
          </Box>
          <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" color="text.secondary">This Week's Earnings</Typography>
              <Typography variant="h2" color="primary.main" sx={{ fontWeight: 900, letterSpacing: -1 }}>
                ${stats.weeklyEarnings.toFixed(2)}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Progress to Weekly Goal ($1,000)</Typography>
                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold' }}>84%</Typography>
              </Box>
              <Box sx={{ width: '100%', height: 10, bgcolor: 'grey.200', borderRadius: 5, overflow: 'hidden' }}>
                <Box sx={{ width: '84%', height: '100%', bgcolor: 'primary.main', borderRadius: 5 }} />
              </Box>
            </Box>

            <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', gap: 1.5, p: 2, bgcolor: 'success.50', borderRadius: 3 }}>
              <Box sx={{ bgcolor: 'success.100', p: 1, borderRadius: 2, display: 'flex', color: 'success.main' }}>
                <TrendingUp />
              </Box>
              <Box>
                <Typography variant="body2" color="success.dark" sx={{ fontWeight: 'bold' }}>
                  Great Job!
                </Typography>
                <Typography variant="caption" color="success.dark">
                  Your earnings are up 12% compared to last week.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Recent Deliveries List */}
        <Paper sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', height: '100%', border: '1px solid', borderColor: 'grey.100' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Active Tasks</Typography>
            <IconButton size="small"><ChevronRight /></IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {recentDeliveries.map((delivery) => (
              <Box 
                key={delivery.id} 
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
                <Avatar sx={{ bgcolor: `${getStatusColor(delivery.status)}.100`, color: `${getStatusColor(delivery.status)}.main`, mr: 2, width: 40, height: 40 }}>
                  <LocationOn fontSize="small" />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 'bold' }}>
                    {delivery.customer}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    {delivery.address}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 'bold' }}>
                    ${delivery.amount.toFixed(2)}
                  </Typography>
                  <Chip 
                    size="small" 
                    label={delivery.status} 
                    color={getStatusColor(delivery.status)}
                    sx={{ height: 20, fontSize: '0.65rem', mt: 0.5, fontWeight: 'bold' }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
          
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'grey.100', textAlign: 'center' }}>
            <Typography variant="body2" color="primary" sx={{ cursor: 'pointer', fontWeight: 'bold' }}>
              View All Tasks
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
