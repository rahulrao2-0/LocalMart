import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Chip, Select, MenuItem, FormControl
} from '@mui/material';
import { fetchOrders, updateOrderStatus } from '../../features/orders/orderSlice';

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
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Orders</Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Update Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((order) => (
              <TableRow key={order.id || order._id}>
                <TableCell>{(order.id || order._id).substring(0, 8)}...</TableCell>
                <TableCell>{order.customer?.name || 'Unknown'}</TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="right">${parseFloat(order.totalAmount).toFixed(2)}</TableCell>
                <TableCell align="center">
                  <Chip 
                    label={order.status} 
                    color={statusColors[order.status] || 'default'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell align="center">
                  <FormControl size="small">
                    <Select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id || order._id, e.target.value)}
                      sx={{ minWidth: 120 }}
                    >
                      <MenuItem value="PENDING">Pending</MenuItem>
                      <MenuItem value="PROCESSING">Processing</MenuItem>
                      <MenuItem value="SHIPPED">Shipped</MenuItem>
                      <MenuItem value="DELIVERED">Delivered</MenuItem>
                      <MenuItem value="CANCELLED">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} align="center">No orders found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OrdersList;
