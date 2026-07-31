import React from 'react';
import { Grid, Typography, Box, Card, CardContent, Avatar } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const StatCard = ({ title, value, icon, color, trend }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
    <Box sx={{
      position: 'absolute',
      right: -20,
      top: -20,
      width: 100,
      height: 100,
      borderRadius: '50%',
      backgroundColor: `${color}15`,
      zIndex: 0
    }} />
    <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>
            {value}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: `${color}20`, color: color, width: 48, height: 48 }}>
          {icon}
        </Avatar>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
          <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} /> {trend}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          vs last month
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="800" gutterBottom>
          Dashboard Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your store today.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Total Sales" 
            value="$12,450" 
            icon={<TrendingUpIcon />} 
            color="#10B981" 
            trend="+14.5%"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Active Orders" 
            value="45" 
            icon={<ShoppingBagIcon />} 
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
        
        {/* Placeholder for Charts / Recent Activity */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6" color="text.secondary">Sales Analytics Chart (Coming Soon)</Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6" color="text.secondary">Recent Orders (Coming Soon)</Typography>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
