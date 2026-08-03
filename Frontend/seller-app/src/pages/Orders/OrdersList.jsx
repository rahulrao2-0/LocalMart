import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Chip, Select, MenuItem, FormControl, Avatar, IconButton, InputLabel, InputAdornment, TextField
} from '@mui/material';
import { fetchOrders, updateOrderStatus } from '../../features/orders/orderSlice';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

const statusColors = {
  'PENDING': 'warning',
  'PROCESSING': 'info',
  'SHIPPED': 'primary',
  'DELIVERED': 'success',
  'CANCELLED': 'error'
};

const OrdersList = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleStatusChange = (orderId, newStatus) => {
    dispatch(updateOrderStatus({ orderId, status: newStatus }));
  };

  return (
    <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
            Manage Orders
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View, track, and update your customer orders.
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'grey.100' }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search order ID or customer..."
            size="small"
            variant="outlined"
            sx={{ flexGrow: 1, minWidth: '250px', '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }
            }}
          />
        </Box>

        <TableContainer sx={{ overflowX: 'auto', borderRadius: 2 }}>
          <Table sx={{ minWidth: 750 }}>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Order Details</TableCell>
                <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', py: 2 }}>Total</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', py: 2 }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', py: 2 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((order) => (
                <TableRow key={order.id || order._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 }, transition: '0.2s', '&:hover': { bgcolor: 'grey.50' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.50', color: 'primary.main', borderRadius: 2 }}>
                        <ReceiptLongIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          #{(order.id || order._id).substring(0, 8).toUpperCase()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Standard Delivery
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{order.customer?.name || 'Guest User'}</Typography>
                    <Typography variant="caption" color="text.secondary">{order.customer?.email || 'N/A'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 'bold' }}>
                      ${parseFloat(order.totalAmount).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={order.status} 
                      color={statusColors[order.status] || 'default'} 
                      size="small"
                      sx={{ fontWeight: 'bold', borderRadius: 1.5, height: 24, fontSize: '0.7rem' }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <FormControl size="small" sx={{ minWidth: 140 }}>
                        <Select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id || order._id, e.target.value)}
                          sx={{ borderRadius: 2, bgcolor: 'background.paper', fontSize: '0.85rem', fontWeight: 500 }}
                        >
                          <MenuItem value="PENDING">Pending</MenuItem>
                          <MenuItem value="PROCESSING">Processing</MenuItem>
                          <MenuItem value="SHIPPED">Shipped</MenuItem>
                          <MenuItem value="DELIVERED">Delivered</MenuItem>
                          <MenuItem value="CANCELLED" sx={{ color: 'error.main' }}>Cancelled</MenuItem>
                        </Select>
                      </FormControl>
                      <IconButton size="small">
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography variant="h6" color="text.secondary">No orders found.</Typography>
                    <Typography variant="body2" color="text.disabled">When customers place orders, they will appear here.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default OrdersList;
