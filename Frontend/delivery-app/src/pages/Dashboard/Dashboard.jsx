import React, { useEffect } from 'react';
import { Grid, Typography, Box, CircularProgress, Alert, Paper, Chip } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData } from '../../redux/features/dashboardSlice';
import StatCard from '../../components/StatCard';
import { 
  LocalShipping, 
  CheckCircle, 
  PendingActions, 
  AttachMoney, 
  StarRate, 
  TrendingUp 
} from '@mui/icons-material';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats, recentDeliveries, loading, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!stats) return null;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">
          Dashboard
        </Typography>
        <Chip 
          label={stats.currentStatus} 
          color={stats.currentStatus === 'Active' ? 'success' : 'default'} 
          sx={{ fontWeight: 'bold' }} 
        />
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Today's Deliveries" 
            value={stats.todaysDeliveries} 
            icon={<LocalShipping />} 
            color="#FF9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Completed" 
            value={stats.completedDeliveries} 
            icon={<CheckCircle />} 
            color="#4CAF50"
            subtitle={`${stats.pendingDeliveries} Pending`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Today's Earnings" 
            value={`$${stats.todaysEarnings.toFixed(2)}`} 
            icon={<AttachMoney />} 
            color="#2196F3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Average Rating" 
            value={stats.averageRating} 
            icon={<StarRate />} 
            color="#FFC107"
          />
        </Grid>
      </Grid>

      {/* Main Content Area */}
      <Grid container spacing={3}>
        {/* Recent Deliveries List */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Recent Deliveries
            </Typography>
            {recentDeliveries.map((delivery, index) => (
              <Box 
                key={delivery.id} 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 2,
                  mb: index !== recentDeliveries.length - 1 ? 2 : 0,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {delivery.id} - {delivery.customer}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {delivery.address}
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="h6" color="primary.main" fontWeight="bold">
                    ${delivery.amount.toFixed(2)}
                  </Typography>
                  <Chip 
                    size="small" 
                    label={delivery.status} 
                    color={
                      delivery.status === 'Delivered' ? 'success' : 
                      delivery.status === 'Out For Delivery' ? 'warning' : 'default'
                    } 
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Weekly Earnings Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight="bold" mb={3}>
              Earnings Overview
            </Typography>
            <Box mb={3}>
              <Typography variant="body2" color="text.secondary">This Week</Typography>
              <Typography variant="h3" fontWeight="bold" color="primary.main">
                ${stats.weeklyEarnings.toFixed(2)}
              </Typography>
            </Box>
            <Box mb={3}>
              <Typography variant="body2" color="text.secondary">This Month</Typography>
              <Typography variant="h4" fontWeight="bold">
                ${stats.monthlyEarnings.toFixed(2)}
              </Typography>
            </Box>
            
            <Box mt="auto" display="flex" alignItems="center" gap={1} p={2} bgcolor="success.50" borderRadius={2}>
              <TrendingUp color="success" />
              <Typography variant="body2" color="success.main" fontWeight="bold">
                Earnings are up 12% from last week
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
