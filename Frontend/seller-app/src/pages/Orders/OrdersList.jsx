import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Select, MenuItem, FormControl, Avatar,
  InputAdornment, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, CircularProgress, Tabs, Tab, Stack, Skeleton, IconButton, Divider,
  useMediaQuery, useTheme, alpha,
} from '@mui/material';
import { fetchOrders, updateOrderStatus } from '../../features/orders/orderSlice';
import SearchIcon from '@mui/icons-material/SearchRounded';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLongRounded';
import CancelIcon from '@mui/icons-material/CancelRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';

const statusColors = {
  'PENDING': 'warning',
  'CONFIRMED': 'info',
  'ACCEPTED': 'info',
  'READY_FOR_PICKUP': 'secondary',
  'SEARCHING_FOR_PARTNER': 'warning',
  'PARTNER_ASSIGNED': 'primary',
  'HEADING_TO_STORE': 'primary',
  'REACHED_STORE': 'primary',
  'PICKED_UP': 'primary',
  'HEADING_TO_CUSTOMER': 'primary',
  'REACHED_LOCATION': 'primary',
  'DELIVERED': 'success',
  'CANCELLED': 'error',
  'RETURNED': 'error',
};

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'READY_FOR_PICKUP', label: 'Processing' },
  { value: 'SEARCHING_FOR_PARTNER', label: 'Searching for Partner' },
  { value: 'PARTNER_ASSIGNED', label: 'Partner Assigned' },
  { value: 'HEADING_TO_STORE', label: 'Heading to Store' },
  { value: 'REACHED_STORE', label: 'Partner Reached Store' },
  { value: 'PICKED_UP', label: 'Picked Up' },
  { value: 'HEADING_TO_CUSTOMER', label: 'Out for Delivery' },
  { value: 'REACHED_LOCATION', label: 'Arrived at Customer' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'RETURNED', label: 'Returned' }
];

// The seller should only manually transition orders between these core states.
// Automated states (like HEADING_TO_CUSTOMER) should be driven by the Delivery Partner.
const SELLER_SELECTABLE_OPTIONS = [
  'PENDING', 'CONFIRMED', 'ACCEPTED', 'READY_FOR_PICKUP', 'CANCELLED'
];

const FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'READY_FOR_PICKUP', label: 'Processing' },
  { value: 'HEADING_TO_CUSTOMER', label: 'Out for Delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const CANCEL_REASONS = [
  'Item out of stock',
  'Merchant store closed',
  'Customer requested cancellation',
  'Delivery partner unavailable',
];

const inr = (value) => `₹${Number(value || 0).toFixed(2)}`;

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recently';

/** Reads an order into the shape both the table row and the mobile card need. */
const readOrder = (order) => {
  const id = order.id || order._id || '';
  return {
    id,
    number: order.orderNumber || `#${id.substring(0, 8).toUpperCase()}`,
    status: order.orderStatus || order.status || 'PENDING',
    customerName:
      order.customer?.name || order.customer?.fullName || order.shippingAddress?.fullName ||
      order.shippingAddress?.name || order.customerName || 'Customer',
    customerEmail: order.customer?.email || order.shippingAddress?.email || 'N/A',
    date: formatDate(order.createdAt),
    total: order.totalAmount,
  };
};

/** A colored dot makes the current state readable without reading the label. */
const StatusDot = ({ status }) => (
  <Box
    component="span"
    sx={{
      width: 8,
      height: 8,
      borderRadius: '50%',
      flexShrink: 0,
      bgcolor: `${statusColors[status] || 'grey'}.main`,
    }}
  />
);

const StatusSelect = ({ status, orderId, onChange, fullWidth }) => (
  <FormControl size="small" fullWidth={fullWidth} sx={{ minWidth: fullWidth ? 0 : 168 }}>
    <Select
      value={status}
      onChange={(e) => onChange(orderId, e.target.value)}
      aria-label="Update order status"
      renderValue={(value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StatusDot status={value} />
          <span>{STATUS_OPTIONS.find((o) => o.value === value)?.label || value}</span>
        </Box>
      )}
      sx={{ fontSize: '0.85rem', fontWeight: 600 }}
    >
      {STATUS_OPTIONS.map((option) => (
        <MenuItem
          key={option.value}
          value={option.value}
          sx={{
            gap: 1.25,
            display: (SELLER_SELECTABLE_OPTIONS.includes(option.value) || option.value === status) ? 'flex' : 'none',
            ...(option.value === 'CANCELLED' && { color: 'error.main', fontWeight: 700 }),
          }}
        >
          <StatusDot status={option.value} />
          {option.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

/** Row rendered as a card below `md`, where the 6-column table can't fit. */
const OrderCard = ({ order, onStatusChange }) => {
  const theme = useTheme();
  const o = readOrder(order);
  const color = statusColors[o.status] || 'default';

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <Avatar
          variant="rounded"
          sx={{
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: 2.5,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
          }}
        >
          <ReceiptLongIcon />
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
            {o.number}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
            {o.date}
          </Typography>
        </Box>
        <Chip
          size="small"
          label={o.status.replace(/_/g, ' ')}
          color={color}
          sx={{ flexShrink: 0, fontWeight: 700, fontSize: '0.65rem', height: 22 }}
        />
      </Box>

      <Divider sx={{ mb: 1.5 }} />

      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 1.5, mb: 1.5 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
            {o.customerName}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
            {o.customerEmail}
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 800, flexShrink: 0 }}>
          {inr(o.total)}
        </Typography>
      </Box>

      <StatusSelect fullWidth status={o.status} orderId={o.id} onChange={onStatusChange} />
    </Paper>
  );
};

const OrdersList = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down('md'));
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));

  const { user } = useSelector((state) => state.auth);
  const { items, loading } = useSelector((state) => state.orders);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
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

  useEffect(() => {
    console.log("[Order Flow Debug] Seller Orders List Updated:", items);
  }, [items]);

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

  // Counts drive the tab badges; both filters run client-side over the orders
  // already in the store.
  const counts = useMemo(() => {
    const map = { ALL: items.length };
    items.forEach((order) => {
      const status = (order.orderStatus || order.status || 'PENDING').toUpperCase();
      let parentStatus = status;
      if (['CONFIRMED', 'ACCEPTED'].includes(status)) parentStatus = 'CONFIRMED';
      else if (['READY_FOR_PICKUP', 'SEARCHING_FOR_PARTNER', 'PARTNER_ASSIGNED', 'HEADING_TO_STORE', 'REACHED_STORE'].includes(status)) parentStatus = 'READY_FOR_PICKUP';
      else if (['PICKED_UP', 'HEADING_TO_CUSTOMER', 'REACHED_LOCATION'].includes(status)) parentStatus = 'HEADING_TO_CUSTOMER';
      else if (['CANCELLED', 'RETURNED'].includes(status)) parentStatus = 'CANCELLED';

      map[parentStatus] = (map[parentStatus] || 0) + 1;
    });
    return map;
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return items.filter((order) => {
      const status = (order.orderStatus || order.status || 'PENDING').toUpperCase();
      
      let matchesFilter = false;
      if (statusFilter === 'ALL') {
        matchesFilter = true;
      } else if (statusFilter === 'PENDING') {
        matchesFilter = status === 'PENDING';
      } else if (statusFilter === 'CONFIRMED') {
        matchesFilter = ['CONFIRMED', 'ACCEPTED'].includes(status);
      } else if (statusFilter === 'READY_FOR_PICKUP') {
        matchesFilter = ['READY_FOR_PICKUP', 'SEARCHING_FOR_PARTNER', 'PARTNER_ASSIGNED', 'HEADING_TO_STORE', 'REACHED_STORE'].includes(status);
      } else if (statusFilter === 'HEADING_TO_CUSTOMER') {
        matchesFilter = ['PICKED_UP', 'HEADING_TO_CUSTOMER', 'REACHED_LOCATION'].includes(status);
      } else if (statusFilter === 'DELIVERED') {
        matchesFilter = status === 'DELIVERED';
      } else if (statusFilter === 'CANCELLED') {
        matchesFilter = ['CANCELLED', 'RETURNED'].includes(status);
      }

      if (!matchesFilter) return false;

      if (!query) return true;
      const orderNum = (order.orderNumber || order.id || order._id || '').toLowerCase();
      const customer = (order.customer?.name || order.shippingAddress?.fullName || '').toLowerCase();
      const email = (order.customer?.email || order.shippingAddress?.email || '').toLowerCase();
      return orderNum.includes(query) || customer.includes(query) || email.includes(query);
    });
  }, [items, searchQuery, statusFilter]);

  const isInitialLoading = loading && items.length === 0;
  const isFiltered = statusFilter !== 'ALL' || Boolean(searchQuery.trim());

  return (
    <Box>
      <PageHeader
        title="Manage Orders"
        subtitle="View, track, and update customer order statuses in real-time."
      />

      <Paper sx={{ p: { xs: 2, sm: 2.5 }, border: `1px solid ${theme.palette.divider}` }}>
        {/* Scrollable so seven filters fit a 360px viewport */}
        <Tabs
          value={statusFilter}
          onChange={(_, value) => setStatusFilter(value)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ mb: 2, borderBottom: `1px solid ${theme.palette.divider}` }}
        >
          {FILTERS.map((filter) => (
            <Tab
              key={filter.value}
              value={filter.value}
              label={`${filter.label}${counts[filter.value] ? ` (${counts[filter.value]})` : ''}`}
            />
          ))}
        </Tabs>

        <Box sx={{ display: 'flex', gap: 2, mb: 2.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search order ID, customer, email…"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1, maxWidth: { sm: 400 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')} aria-label="Clear search">
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {filteredItems.length} of {items.length} orders
          </Typography>
        </Box>

        {isInitialLoading ? (
          <Stack spacing={1.5}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="rounded" height={isCompact ? 180 : 72} />
            ))}
          </Stack>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={<ReceiptLongIcon />}
            title={isFiltered ? 'No matching orders' : 'No orders yet'}
            description={
              isFiltered
                ? 'Try a different search term or status filter.'
                : 'When customers place orders, they will appear here.'
            }
            action={
              isFiltered ? (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                  }}
                >
                  Reset filters
                </Button>
              ) : null
            }
          />
        ) : isCompact ? (
          <Stack spacing={1.5}>
            {filteredItems.map((order) => (
              <OrderCard
                key={order.id || order._id}
                order={order}
                onStatusChange={handleStatusChange}
              />
            ))}
          </Stack>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 820 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Order Details</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems.map((order) => {
                  const o = readOrder(order);
                  return (
                    <TableRow key={o.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            variant="rounded"
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: 2.5,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: 'primary.main',
                            }}
                          >
                            <ReceiptLongIcon />
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {o.number}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Standard Delivery
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {o.customerName}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          sx={{ display: 'block', maxWidth: 200 }}
                        >
                          {o.customerEmail}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {o.date}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 800 }}>
                          {inr(o.total)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={o.status.replace(/_/g, ' ')}
                          color={statusColors[o.status] || 'default'}
                          size="small"
                          sx={{ fontWeight: 700, height: 24, fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <StatusSelect status={o.status} orderId={o.id} onChange={handleStatusChange} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Cancel Order Dialog for Seller */}
      <Dialog
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        maxWidth="xs"
        fullWidth
        fullScreen={isPhone}
      >
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Please select the reason for cancelling this order. The customer will be notified via
            email &amp; push notification.
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            label="Cancellation Reason"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          >
            {CANCEL_REASONS.map((reason) => (
              <MenuItem key={reason} value={reason}>
                {reason}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelModalOpen(false)} disabled={submitting} sx={{ fontWeight: 700 }}>
            Back
          </Button>
          <Button
            onClick={handleConfirmCancel}
            variant="contained"
            color="error"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <CancelIcon />}
            sx={{ px: 3 }}
          >
            Cancel Order
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrdersList;
