import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Alert,
  Avatar,
  Tooltip,
  IconButton,
  Skeleton,
} from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from 'recharts';
import TwoWheelerRoundedIcon from '@mui/icons-material/TwoWheelerRounded';
import CurrencyRupeeRoundedIcon from '@mui/icons-material/CurrencyRupeeRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import RouteRoundedIcon from '@mui/icons-material/RouteRounded';
import PowerSettingsNewRoundedIcon from '@mui/icons-material/PowerSettingsNewRounded';
import StatCard from '../../components/StatCard';
import StatusChip from '../../components/StatusChip';
import EmptyState from '../../components/EmptyState';
import DeliveryMap from '../../components/Map/DeliveryMap';
import useGeolocation from '../../hooks/useGeolocation';
import { PIN_COLORS } from '../../components/Map/mapIcons';
import { fetchDashboardData } from '../../redux/features/dashboardSlice';
import { setDuty } from '../../redux/features/uiSlice';
import { selectDeliveries, fetchDeliveries } from '../../redux/features/deliveriesSlice';
import { getActiveDeliveries, getNewDeliveries, nextStopOf } from '../../data/mockDeliveries';
import { formatCurrency, formatCompactCurrency, formatRelative } from '../../utils/format';
import { formatDistance, orderByProximity } from '../../utils/geo';

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

/** Small labelled metric used inside the performance card. */
const MiniMetric = ({ icon: Icon, label, value, tone = 'primary' }) => (
  <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
    <Box
      sx={{
        width: 34,
        height: 34,
        flexShrink: 0,
        borderRadius: 2,
        display: 'grid',
        placeItems: 'center',
        bgcolor: `${tone}.50`,
        color: `${tone}.main`,
      }}
    >
      <Icon sx={{ fontSize: 18 }} />
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" noWrap sx={{ color: 'text.secondary', display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="subtitle2" noWrap sx={{ fontWeight: 800 }}>
        {value}
      </Typography>
    </Box>
  </Stack>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { stats, recentDeliveries, chartData, loading, error } = useSelector((state) => state.dashboard);
  const { user } = useSelector((state) => state.auth);
  const isOnDuty = useSelector((state) => state.ui.isOnDuty);
  const deliveries = useSelector(selectDeliveries);

  // A one-shot fix is enough for a preview widget; the Live Map watches instead.
  const { position, coords, accuracy } = useGeolocation({ watch: false });

  const active = useMemo(() => getActiveDeliveries(deliveries), [deliveries]);
  const requests = useMemo(() => getNewDeliveries(deliveries), [deliveries]);

  useEffect(() => {
    dispatch(fetchDashboardData());
    dispatch(fetchDeliveries());
  }, [dispatch]);

  const widgetMarkers = useMemo(() => {
    const stops = orderByProximity(coords, active.map((delivery) => ({ ...nextStopOf(delivery), delivery })));
    return stops.slice(0, 5).map((stop, index) => ({
      id: `${stop.delivery.id}-${stop.kind}`,
      position: stop.position,
      label: index + 1,
      color: stop.kind === 'pickup' ? PIN_COLORS.pickup : PIN_COLORS.drop,
      title: stop.kind === 'pickup' ? stop.name : stop.delivery.customer.name,
      subtitle: stop.address,
    }));
  }, [active, coords]);

  const firstName = (user?.name || 'Driver').split(' ')[0];
  const targetProgress = stats ? Math.min(100, (stats.todaysEarnings / stats.todayTarget) * 100) : 0;

  return (
    <Box>
      {/* Greeting / duty banner */}
      <Card
        sx={{
          mb: { xs: 2.5, md: 3 },
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
          color: '#fff',
          border: 'none',
          background: 'linear-gradient(120deg, #C43A05 0%, #F04A08 42%, #FF9E73 100%)',
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            top: -140,
            right: -80,
            background: 'radial-gradient(circle, rgba(255,255,255,0.26) 0%, transparent 70%)',
          }}
        />
        <CardContent sx={{ p: { xs: 2.25, sm: 3 }, position: 'relative' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {greeting()}, {firstName} 👋
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.25 }}>
                {isOnDuty ? "You're online and taking jobs" : "You're offline right now"}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Chip
                  size="small"
                  label={`${requests.length} new ${requests.length === 1 ? 'request' : 'requests'}`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700 }}
                />
                <Chip
                  size="small"
                  label={`${active.length} in progress`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700 }}
                />
                {stats && (
                  <Chip
                    size="small"
                    label={`${stats.hoursOnline} hrs online`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700 }}
                  />
                )}
              </Stack>
            </Box>

            <Stack direction="row" spacing={1} sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => dispatch(setDuty(!isOnDuty))}
                startIcon={<PowerSettingsNewRoundedIcon />}
                sx={{
                  bgcolor: '#fff',
                  color: 'primary.dark',
                  boxShadow: 'none',
                  whiteSpace: 'nowrap',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)', boxShadow: 'none' },
                }}
              >
                {isOnDuty ? 'Go offline' : 'Go online'}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/map')}
                startIcon={<MapRoundedIcon />}
                sx={{
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,0.6)',
                  whiteSpace: 'nowrap',
                  '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.12)' },
                }}
              >
                Live map
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2.5, borderRadius: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => dispatch(fetchDashboardData())}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Stat tiles — CSS Grid, so the layout is independent of MUI's Grid API. */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
          gap: { xs: 1.5, sm: 2 },
          mb: { xs: 2.5, md: 3 },
        }}
      >
        <StatCard
          title="Today's earnings"
          value={stats ? formatCurrency(stats.todaysEarnings) : '—'}
          subtitle={stats ? `Target ${formatCurrency(stats.todayTarget)}` : undefined}
          icon={<CurrencyRupeeRoundedIcon />}
          tone="success"
          trend="up"
          trendValue="12%"
          loading={loading}
          onClick={() => navigate('/earnings')}
        />
        <StatCard
          title="Deliveries today"
          value={stats ? stats.todaysDeliveries : '—'}
          subtitle={stats ? `${stats.completedDeliveries} completed` : undefined}
          icon={<TwoWheelerRoundedIcon />}
          tone="primary"
          loading={loading}
          onClick={() => navigate('/history')}
        />
        <StatCard
          title="Pending jobs"
          value={stats ? stats.pendingDeliveries : '—'}
          subtitle={`${requests.length} awaiting acceptance`}
          icon={<PendingActionsRoundedIcon />}
          tone="warning"
          loading={loading}
          onClick={() => navigate('/deliveries')}
        />
        <StatCard
          title="Rating"
          value={stats ? stats.averageRating.toFixed(1) : '—'}
          subtitle={stats ? `${stats.totalRatings} ratings` : undefined}
          icon={<StarRoundedIcon />}
          tone="secondary"
          loading={loading}
          onClick={() => navigate('/profile')}
        />
      </Box>

      {/* Chart + map widget */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.35fr 1fr' },
          gap: { xs: 2, md: 2.5 },
          mb: { xs: 2.5, md: 3 },
        }}
      >
        <Card sx={{ borderRadius: 4, minWidth: 0 }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Stack direction="row" spacing={1} sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Earnings this week
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {stats ? `${formatCurrency(stats.weeklyEarnings)} total` : 'Loading…'}
                </Typography>
              </Box>
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={() => dispatch(fetchDashboardData())}>
                  <RefreshRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>

            <Box sx={{ height: { xs: 200, sm: 240 }, mx: -1 }}>
              {loading || !chartData.length ? (
                <Skeleton variant="rounded" height="100%" sx={{ borderRadius: 3 }} />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="earningsFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF5C1A" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#FF5C1A" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="rgba(148,163,184,0.28)" />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.6 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={46}
                      tickFormatter={(value) => formatCompactCurrency(value)}
                      tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.6 }}
                    />
                    <ChartTooltip
                      formatter={(value, name) =>
                        name === 'earnings' ? [formatCurrency(value), 'Earnings'] : [value, 'Deliveries']
                      }
                      contentStyle={{
                        borderRadius: 12,
                        border: 'none',
                        boxShadow: '0 8px 24px rgba(15,23,42,0.16)',
                        fontSize: 13,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="earnings"
                      stroke="#FF5C1A"
                      strokeWidth={2.5}
                      fill="url(#earningsFill)"
                      dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
                gap: 1.75,
              }}
            >
              <MiniMetric
                icon={CheckCircleRoundedIcon}
                label="Acceptance"
                value={stats ? `${stats.acceptanceRate}%` : '—'}
                tone="success"
              />
              <MiniMetric
                icon={ScheduleRoundedIcon}
                label="On time"
                value={stats ? `${stats.onTimeRate}%` : '—'}
                tone="secondary"
              />
              <MiniMetric
                icon={RouteRoundedIcon}
                label="Distance"
                value={stats ? formatDistance(stats.distanceKm) : '—'}
                tone="primary"
              />
              <MiniMetric
                icon={SpeedRoundedIcon}
                label="Hours"
                value={stats ? `${stats.hoursOnline} h` : '—'}
                tone="warning"
              />
            </Box>
          </CardContent>
        </Card>

        <Stack spacing={{ xs: 2, md: 2.5 }} sx={{ minWidth: 0 }}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Daily target
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'success.main' }}>
                  {Math.round(targetProgress)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={targetProgress}
                color="success"
                sx={{ mb: 1.25, bgcolor: 'success.50' }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {stats
                  ? `${formatCurrency(stats.todaysEarnings)} of ${formatCurrency(stats.todayTarget)} — ${formatCurrency(Math.max(0, stats.todayTarget - stats.todaysEarnings))} to go`
                  : 'Loading…'}
              </Typography>
            </CardContent>
          </Card>

          {/* Map widget */}
          <Card sx={{ borderRadius: 4, overflow: 'hidden', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5 }, pb: 1.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Nearby stops
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {widgetMarkers.length
                      ? `${widgetMarkers.length} stop${widgetMarkers.length === 1 ? '' : 's'} on your route`
                      : 'No active stops'}
                  </Typography>
                </Box>
                <Button size="small" endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate('/map')}>
                  Open
                </Button>
              </Stack>
            </CardContent>
            <Box sx={{ px: { xs: 2, sm: 2.5 }, pb: { xs: 2, sm: 2.5 } }}>
              <DeliveryMap
                height={230}
                compact
                fitAll
                interactive={false}
                driver={position || coords}
                accuracy={accuracy}
                markers={widgetMarkers}
              >
                {/* Preview only — the whole surface opens the full map. */}
                <Box
                  onClick={() => navigate('/map')}
                  sx={{ position: 'absolute', inset: 0, zIndex: 450, cursor: 'pointer' }}
                />
              </DeliveryMap>
            </Box>
          </Card>
        </Stack>
      </Box>

      {/* Active jobs + recent activity */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: { xs: 2, md: 2.5 },
        }}
      >
        <Card sx={{ borderRadius: 4, minWidth: 0 }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Active jobs
              </Typography>
              <Button size="small" endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate('/deliveries')}>
                All jobs
              </Button>
            </Stack>

            {!active.length ? (
              <EmptyState
                dense
                icon={TwoWheelerRoundedIcon}
                title="No jobs in progress"
                description="Accepted deliveries show up here with their next stop."
                actionLabel="Browse requests"
                onAction={() => navigate('/deliveries')}
              />
            ) : (
              <Stack divider={<Divider />}>
                {active.map((delivery) => {
                  const stop = nextStopOf(delivery);
                  return (
                    <Stack
                      key={delivery.id}
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      onClick={() => navigate(`/deliveries/${delivery.id}`)}
                      sx={{
                        py: 1.5,
                        cursor: 'pointer',
                        borderRadius: 2,
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Avatar sx={{ bgcolor: 'primary.50', color: 'primary.main', width: 40, height: 40 }}>
                        <TwoWheelerRoundedIcon fontSize="small" />
                      </Avatar>
                      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
                            {delivery.customer.name}
                          </Typography>
                          <StatusChip status={delivery.status} />
                        </Stack>
                        <Typography variant="caption" noWrap sx={{ color: 'text.secondary', display: 'block' }}>
                          {stop.kind === 'pickup' ? 'Pick up at ' : 'Drop at '}
                          {stop.address}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                          {formatCurrency(delivery.payout)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {formatDistance(delivery.distanceKm)}
                        </Typography>
                      </Box>
                    </Stack>
                  );
                })}
              </Stack>
            )}
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 4, minWidth: 0 }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Recent activity
              </Typography>
              <Button size="small" endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate('/history')}>
                History
              </Button>
            </Stack>

            {loading ? (
              <Stack spacing={1.5}>
                {[0, 1, 2, 3].map((key) => (
                  <Skeleton key={key} variant="rounded" height={52} sx={{ borderRadius: 2 }} />
                ))}
              </Stack>
            ) : !recentDeliveries.length ? (
              <EmptyState dense title="No deliveries yet" description="Your completed jobs will appear here." />
            ) : (
              <Stack divider={<Divider />}>
                {recentDeliveries.map((item) => (
                  <Stack key={item.id} direction="row" spacing={1.5} alignItems="center" sx={{ py: 1.5 }}>
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
                          {item.customer}
                        </Typography>
                        <StatusChip status={item.status} />
                      </Stack>
                      <Typography variant="caption" noWrap sx={{ color: 'text.secondary', display: 'block' }}>
                        {item.area} · {formatRelative(item.date)}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, flexShrink: 0 }}>
                      {formatCurrency(item.payout)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;
