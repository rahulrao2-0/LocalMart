import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Chip, Select, MenuItem, FormControl, Avatar, IconButton, InputAdornment, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Alert
} from '@mui/material';
import { fetchOrders, updateOrderStatus } from '../../features/orders/orderSlice';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CancelIcon from '@mui/icons-material/Cancel';

const statusColors = {
  'PENDING': 'warning',
  'CONFIRMED': 'info',
  'PROCESSING': 'secondary',
  'OUT_FOR_DELIVERY': 'primary',
  'DELIVERED': 'success',
  'CANCELLED': 'error'
};

const OrdersList = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items, loading } = useSelector((state) => state.orders);

  const [searchQuery, setSearchQuery] = useState('');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('Item out of stock');
  const [submitting, setSubmitting] = useState(false);

  const sellerId = user?.id || user?._id || user?.sellerId || "seller-001";

  useEffect(() => {
    if (sellerId) {
      dispatch(fetchOrders(sellerId));
    }
  }, [dispatch, sellerId]);

  const handleStatusChange = (orderId, newStatus) => {
    if (newStatus === 'CANCELLED') {
      setSelectedOrderId(orderId);
      setCancelReason('Item out of stock');
      setCancelModalOpen(true);
    } else {
      dispatch(updateOrderStatus({ orderId, status: newStatus }));
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedOrderId) return;
    setSubmitting(true);
    try {
      await dispatch(updateOrderStatus({ 
        orderId: selectedOrderId, 
        status: 'CANCELLED', 
        reason: cancelReason 
      })).unwrap();
      setCancelModalOpen(false);
    } catch (err) {
      console.error("Failed to cancel order:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = items.filter((order) => {
    const orderNum = (order.orderNumber || order.id || order._id || '').toLowerCase();
    const customer = (order.customer?.name || order.shippingAddress?.fullName || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return orderNum.includes(query) || customer.includes(query);
  });

  return (
    <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
            Manage Orders
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View, track, and update customer order statuses in real-time.
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'grey.100' }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search order ID or customer..."
            size="small"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
              {loading && items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : filteredItems.map((order) => {
                const customerName = order.customer?.name || order.customer?.fullName || order.shippingAddress?.fullName || order.shippingAddress?.name || order.customerName || 'Customer';
                const customerEmail = order.customer?.email || order.shippingAddress?.email || 'N/A';
                const orderId = order.id || order._id;
                const orderNum = order.orderNumber || `#${orderId.substring(0, 8).toUpperCase()}`;
                const currentStatus = order.orderStatus || order.status || 'PENDING';

                return (
                  <TableRow key={orderId} hover sx={{ '&:last-child td, &:last-child th': { border: 0 }, transition: '0.2s', '&:hover': { bgcolor: 'grey.50' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.50', color: 'primary.main', borderRadius: 2 }}>
                          <ReceiptLongIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {orderNum}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Standard Delivery
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{customerName}</Typography>
                      <Typography variant="caption" color="text.secondary">{customerEmail}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 'bold' }}>
                        ₹{parseFloat(order.totalAmount || 0).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={currentStatus} 
                        color={statusColors[currentStatus] || 'default'} 
                        size="small"
                        sx={{ fontWeight: 'bold', borderRadius: 1.5, height: 24, fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                          <Select
                            value={currentStatus}
                            onChange={(e) => handleStatusChange(orderId, e.target.value)}
                            sx={{ borderRadius: 2, bgcolor: 'background.paper', fontSize: '0.85rem', fontWeight: 600 }}
                          >
                            <MenuItem value="PENDING">Pending</MenuItem>
                            <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                            <MenuItem value="PROCESSING">Processing</MenuItem>
                            <MenuItem value="OUT_FOR_DELIVERY">Out for Delivery</MenuItem>
                            <MenuItem value="DELIVERED">Delivered</MenuItem>
                            <MenuItem value="CANCELLED" sx={{ color: 'error.main', fontWeight: 'bold' }}>Cancel Order</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredItems.length === 0 && !loading && (
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

      {/* Cancel Order Dialog for Seller */}
      <Dialog open={cancelModalOpen} onClose={() => setCancelModalOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Cancel Order</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please select the reason for cancelling this order. The customer will be notified via email & push notification.
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            label="Cancellation Reason"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          >
            <MenuItem value="Item out of stock">Item out of stock</MenuItem>
            <MenuItem value="Merchant store closed">Merchant store closed</MenuItem>
            <MenuItem value="Customer requested cancellation">Customer requested cancellation</MenuItem>
            <MenuItem value="Delivery partner unavailable">Delivery partner unavailable</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCancelModalOpen(false)} disabled={submitting} sx={{ borderRadius: 2, fontWeight: 700 }}>
            Back
          </Button>
          <Button
            onClick={handleConfirmCancel}
            variant="contained"
            color="error"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <CancelIcon />}
            sx={{ borderRadius: 2.5, fontWeight: 700, px: 3 }}
          >
            Cancel Order
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrdersList;
