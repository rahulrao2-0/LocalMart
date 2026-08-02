import React from 'react';
import { Box, Typography, Grid, Paper, Divider, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
import { AttachMoney, AccountBalanceWallet, TrendingUp, History as HistoryIcon } from '@mui/icons-material';
import StatCard from '../../components/StatCard';

const mockPayouts = [
  { id: 'PAY-001', date: '2023-10-15', amount: 840.20, status: 'Settled' },
  { id: 'PAY-002', date: '2023-10-08', amount: 795.50, status: 'Settled' },
  { id: 'PAY-003', date: '2023-10-01', amount: 820.00, status: 'Settled' },
];

const Earnings = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Earnings
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={4}>
          <StatCard 
            title="Today's Earnings" 
            value="$150.50" 
            icon={<AttachMoney />} 
            color="#4CAF50"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard 
            title="Weekly Earnings" 
            value="$840.20" 
            icon={<TrendingUp />} 
            color="#2196F3"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard 
            title="Available Balance" 
            value="$320.00" 
            icon={<AccountBalanceWallet />} 
            color="#FF9800"
            subtitle="Next payout on Sunday"
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <HistoryIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Settlement History
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <List>
          {mockPayouts.map((payout, index) => (
            <React.Fragment key={payout.id}>
              <ListItem sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'success.light', color: 'success.main' }}>
                    <AccountBalanceWallet />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={<Typography fontWeight="bold">{payout.id}</Typography>} 
                  secondary={payout.date} 
                />
                <Box textAlign="right">
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    +${payout.amount.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {payout.status}
                  </Typography>
                </Box>
              </ListItem>
              {index < mockPayouts.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default Earnings;
