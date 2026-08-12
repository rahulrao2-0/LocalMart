import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Grid, Typography, Box, Paper, Chip, Button, Avatar, CircularProgress,
  Stack, Divider, useTheme, alpha,
} from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBagRounded';
import Inventory2Icon from '@mui/icons-material/Inventory2Rounded';
import WarningAmberIcon from '@mui/icons-material/WarningAmberRounded';
import LocalShippingIcon from '@mui/icons-material/LocalShippingRounded';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import AddIcon from '@mui/icons-material/AddRounded';
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardRounded';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLongRounded';
import { fetchOrders } from '../../features/orders/orderSlice';
import { fetchProducts } from '../../features/products/productSlice';
import StatCard from '../../components/common/StatCard';
import EmptyState from '../../components/common/EmptyState';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const LOW_STOCK_THRESHOLD = 10;

const REVENUE_STATUSES = ['CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED'];

const isRevenueOrder = (order) => {
  const status = (order.orderStatus || order.status || '').toUpperCase();
  if (status === 'CANCELLED') return false;
  return order.paymentStatus === 'COMPLETED' || REVENUE_STATUSES.includes(status);
};

const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'PENDING':
    case 'PROCESSING':
      return 'warning';
    case 'CONFIRMED':
    case 'OUT_FOR_DELIVERY':
      return 'info';
    case 'DELIVERED':
      return 'success';
    case 'CANCELLED':
      return 'error';
    default:
      return 'primary';
  }
};

const inr = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { items: orders = [], loading: ordersLoading } = useSelector((state) => state.orders);
  const { items: products = [] } = useSelector((state) => state.products);

  const sellerId = user?.id || user?._id || user?.sellerId || 'seller-001';

  useEffect(() => {
    if (!sellerId) return;
    dispatch(fetchOrders(sellerId));
    dispatch(fetchProducts(sellerId));
  }, [dispatch, sellerId]);

  // Every figure below is derived from data already in the store — the previous
  // version showed a hardcoded low-stock count and invented trend percentages.
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce(
      (sum, o) => (isRevenueOrder(o) ? sum + (Number(o.totalAmount) || 0) : sum),
      0,
    );
    const byStatus = (...names) =>
      orders.filter((o) => names.includes((o.orderStatus || o.status || '').toUpperCase())).length;

    const lowStock = products.filter(
      (p) => Number(p.stockAvailable) < LOW_STOCK_THRESHOLD,
    ).length;

    return {
      totalRevenue,
      pending: byStatus('PENDING', 'PROCESSING'),
      delivered: byStatus('DELIVERED'),
      cancelled: byStatus('CANCELLED'),
      lowStock,
      outOfStock: products.filter((p) => Number(p.stockAvailable) === 0).length,
    };
  }, [orders, products]);

  // Revenue per weekday, from real order dates.
  const chart = useMemo(() => {
    const totals = new Array(7).fill(0);
    orders.forEach((order) => {
      if (!order.createdAt || !isRevenueOrder(order)) return;
      const day = new Date(order.createdAt).getDay(); // 0 = Sunday
      totals[(day + 6) % 7] += Number(order.totalAmount) || 0;
    });
    const peak = Math.max(...totals);
    const todayIndex = (new Date().getDay() + 6) % 7;
    return { totals, peak, todayIndex, hasData: peak > 0 };
  }, [orders]);

  const recentOrders = orders.slice(0, 5);
  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Box>
      {/* Hero */}
      <Paper
        sx={{
          p: { xs: 2.5, sm: 3.5, md: 4.5 },
          mb: { xs: 2.5, md: 3.5 },
          borderRadius: 5,
          border: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.12)} 0%, ${alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.16 : 0.06)} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 3,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.75 }}>
            Welcome back{user?.ownerName ? `, ${user.ownerName.split(' ')[0]}` : ''}! 👋
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            {currentDate} · Here's what's happening with your store today.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/dashboard/products')}
            >
              Add Product
            </Button>
            <Button
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/dashboard/orders')}
            >
              Manage Orders
            </Button>
          </Stack>
        </Box>

        <Box
          aria-hidden
          sx={{
            display: { xs: 'none', md: 'grid' },
            placeItems: 'center',
            flexShrink: 0,
            width: 116,
            height: 116,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.primary.main, 0.12),
          }}
        >
          <ShoppingBagIcon sx={{ fontSize: 60, color: 'primary.main' }} />
        </Box>
      </Paper>

      {/* Stat tiles — two-up on phones, four-up from md */}
      <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: { xs: 2.5, md: 3.5 } }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            title="Total Revenue"
            value={inr(stats.totalRevenue)}
            icon={<AccountBalanceWalletIcon />}
            gradient="linear-gradient(135deg, #10B981 0%, #059669 100%)"
            caption={`${stats.delivered} delivered`}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            title="Pending Orders"
            value={stats.pending}
            icon={<LocalShippingIcon />}
            gradient="linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)"
            caption="Awaiting action"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            title="Total Orders"
            value={orders.length}
            icon={<Inventory2Icon />}
            gradient="linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)"
            caption={`${stats.cancelled} cancelled`}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            title="Low Stock"
            value={stats.lowStock}
            icon={<WarningAmberIcon />}
            gradient="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
            caption={stats.outOfStock ? `${stats.outOfStock} out of stock` : `Under ${LOW_STOCK_THRESHOLD} units`}
          />
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 2.5, md: 3 }}>
        {/* Revenue chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper
            sx={{
              p: { xs: 2.5, md: 3.5 },
              height: '100%',
              minHeight: 340,
              display: 'flex',
              flexDirection: 'column',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 1,
                mb: 1,
              }}
            >
              <Box>
                <Typography variant="h6">Revenue Overview</Typography>
                <Typography variant="caption" color="text.secondary">
                  By day of week
                </Typography>
              </Box>
              <Chip label="This week" size="small" variant="outlined" />
            </Box>

            {!chart.hasData ? (
              <EmptyState
                dense
                icon={<AccountBalanceWalletIcon />}
                title="No revenue yet"
                description="Once orders are confirmed, your weekly revenue breakdown appears here."
              />
            ) : (
              <Box
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: { xs: 0.5, sm: 1.5 },
                  pt: 4,
                  minHeight: 200,
                }}
              >
                {chart.totals.map((total, index) => {
                  const pct = chart.peak ? (total / chart.peak) * 100 : 0;
                  const isToday = index === chart.todayIndex;
                  return (
                    <Box
                      key={WEEKDAYS[index]}
                      sx={{
                        // flex:1 keeps all seven bars inside a 360px viewport
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.75,
                        height: '100%',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: '0.6rem', sm: '0.7rem' },
                          color: isToday ? 'primary.main' : 'text.secondary',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {total > 0 ? inr(total) : '—'}
                      </Typography>
                      <Box
                        sx={{
                          width: '100%',
                          maxWidth: 44,
                          height: `${Math.max(pct, 2)}%`,
                          minHeight: 4,
                          borderRadius: '10px 10px 4px 4px',
                          background: isToday
                            ? `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.25)} 100%)`
                            : `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.45)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
                          transition: 'height .5s ease, background .2s ease',
                          '&:hover': {
                            background: `linear-gradient(180deg, ${theme.palette.secondary.main} 0%, ${alpha(theme.palette.secondary.main, 0.2)} 100%)`,
                          },
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: '0.65rem', sm: '0.75rem' },
                          color: isToday ? 'primary.main' : 'text.secondary',
                        }}
                      >
                        {WEEKDAYS[index]}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Recent orders */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper
            sx={{
              p: { xs: 2.5, md: 3 },
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Orders
            </Typography>

            {ordersLoading && orders.length === 0 ? (
              <Box sx={{ display: 'grid', placeItems: 'center', flexGrow: 1, py: 4 }}>
                <CircularProgress size={30} />
              </Box>
            ) : recentOrders.length === 0 ? (
              <EmptyState
                dense
                icon={<ReceiptLongIcon />}
                title="No orders yet"
                description="New customer orders will show up here."
              />
            ) : (
              <Stack spacing={1.25} sx={{ flexGrow: 1 }}>
                {recentOrders.map((order) => {
                  const id = order._id || order.id || '';
                  const orderNum = order.orderNumber || `#${id.substring(0, 8).toUpperCase()}`;
                  const status = order.orderStatus || order.status || 'PENDING';
                  const color = getStatusColor(status);
                  const customerName =
                    order.customer?.name ||
                    order.customer?.fullName ||
                    order.shippingAddress?.fullName ||
                    order.shippingAddress?.name ||
                    order.customerName ||
                    'Customer';
                  const dateStr = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Recently';

                  return (
                    <Box
                      key={id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: 'background.subtle',
                        border: `1px solid ${theme.palette.divider}`,
                        transition: 'background-color .2s ease',
                        '&:hover': { bgcolor: 'background.muted' },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          flexShrink: 0,
                          bgcolor: alpha(theme.palette[color].main, 0.15),
                          color: `${color}.main`,
                        }}
                      >
                        {customerName.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
                          {customerName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                          {orderNum} · {dateStr}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                          {inr(order.totalAmount)}
                        </Typography>
                        <Chip
                          size="small"
                          label={status.replace(/_/g, ' ')}
                          color={color}
                          variant="outlined"
                          sx={{ mt: 0.5, height: 20, fontSize: '0.6rem' }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            )}

            <Divider sx={{ mt: 2.5, mb: 1 }} />
            <Button
              fullWidth
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/dashboard/orders')}
              sx={{ fontWeight: 700 }}
            >
              View all orders
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
