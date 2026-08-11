import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Divider,
  Button,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
  Avatar,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import CurrencyRupeeRoundedIcon from '@mui/icons-material/CurrencyRupeeRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TwoWheelerRoundedIcon from '@mui/icons-material/TwoWheelerRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import RouteRoundedIcon from '@mui/icons-material/RouteRounded';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import { fetchDashboardData } from '../../redux/features/dashboardSlice';
import { formatCurrency, formatCompactCurrency, formatDate } from '../../utils/format';
import { formatDistance } from '../../utils/geo';
import { mockHistory } from '../../data/mockDeliveries';

const PAYOUTS = [
  { id: 'PAY-4471', date: '2026-08-10T09:00:00', amount: 7420, status: 'Settled', mode: 'UPI · HDFC ••4412' },
  { id: 'PAY-4438', date: '2026-08-03T09:00:00', amount: 6985, status: 'Settled', mode: 'UPI · HDFC ••4412' },
  { id: 'PAY-4402', date: '2026-07-27T09:00:00', amount: 7310, status: 'Settled', mode: 'UPI · HDFC ••4412' },
  { id: 'PAY-4377', date: '2026-07-20T09:00:00', amount: 6640, status: 'Settled', mode: 'UPI · HDFC ••4412' },
];

const BREAKDOWN = [
  { label: 'Trip payouts', value: 6820, tone: 'primary' },
  { label: 'Distance bonus', value: 940, tone: 'secondary' },
  { label: 'Peak-hour surge', value: 520, tone: 'warning' },
  { label: 'Customer tips', value: 180, tone: 'success' },
];

const RANGES = [
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
];

export default function Earnings() {
  const dispatch = useDispatch();
  const { stats, chartData, loading } = useSelector((state) => state.dashboard);
  const [range, setRange] = useState('week');

  // Earnings can be a cold entry point (deep link, bottom nav), so make sure the
  // shared dashboard figures are loaded.
  useEffect(() => {
    if (!stats) dispatch(fetchDashboardData());
  }, [dispatch, stats]);

  const pendingBalance = 3260;
  const totalBreakdown = BREAKDOWN.reduce((sum, item) => sum + item.value, 0);

  // The month view is derived from the weekly series so the demo stays coherent
  // without a second dataset.
  const series = useMemo(() => {
    if (range === 'week') return chartData;
    return ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((name, index) => ({
      name,
      earnings: Math.round((chartData.reduce((sum, day) => sum + day.earnings, 0) || 0) * (0.92 + index * 0.04)),
      deliveries: Math.round((chartData.reduce((sum, day) => sum + day.deliveries, 0) || 0) * (0.92 + index * 0.04)),
    }));
  }, [range, chartData]);

  const best = useMemo(
    () => series.reduce((top, item) => (item.earnings > (top?.earnings ?? 0) ? item : top), null),
    [series],
  );

  const totalDistance = mockHistory.reduce((sum, row) => sum + row.distanceKm, 0);

  return (
    <Box>
      <PageHeader
        icon={AccountBalanceWalletRoundedIcon}
        title="Earnings"
        subtitle="Payouts, bonuses and settlement history for your account."
        actions={
          <Button variant="outlined" startIcon={<DownloadRoundedIcon />}>
            Statement
          </Button>
        }
      />

      {/* Headline numbers */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
          gap: { xs: 1.5, sm: 2 },
          mb: { xs: 2.5, md: 3 },
        }}
      >
        <StatCard
          title="Today"
          value={stats ? formatCurrency(stats.todaysEarnings) : '—'}
          subtitle={stats ? `${stats.todaysDeliveries} deliveries` : undefined}
          icon={<CurrencyRupeeRoundedIcon />}
          tone="success"
          loading={loading}
        />
        <StatCard
          title="This week"
          value={stats ? formatCurrency(stats.weeklyEarnings) : '—'}
          icon={<TrendingUpRoundedIcon />}
          tone="primary"
          trend="up"
          trendValue="9%"
          loading={loading}
        />
        <StatCard
          title="This month"
          value={stats ? formatCurrency(stats.monthlyEarnings) : '—'}
          icon={<ReceiptLongRoundedIcon />}
          tone="secondary"
          loading={loading}
        />
        <StatCard
          title="Unsettled"
          value={formatCurrency(pendingBalance)}
          subtitle="Pays out Monday 9 am"
          icon={<AccountBalanceWalletRoundedIcon />}
          tone="warning"
          loading={loading}
        />
      </Box>

      {/* Chart + breakdown */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.4fr 1fr' },
          gap: { xs: 2, md: 2.5 },
          mb: { xs: 2, md: 2.5 },
        }}
      >
        <Card sx={{ borderRadius: 4, minWidth: 0 }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 1.5,
                mb: 2,
              }}
            >
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Earnings trend
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {best ? `Best: ${best.name} · ${formatCurrency(best.earnings)}` : 'Loading…'}
                </Typography>
              </Box>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={range}
                onChange={(_, value) => value && setRange(value)}
              >
                {RANGES.map((option) => (
                  <ToggleButton key={option.value} value={option.value} sx={{ px: 1.75 }}>
                    {option.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            <Box sx={{ height: { xs: 220, sm: 280 }, mx: -1 }}>
              {loading || !series.length ? (
                <Skeleton variant="rounded" height="100%" sx={{ borderRadius: 3 }} />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="28%">
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
                      cursor={{ fill: 'rgba(148,163,184,0.12)' }}
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
                    <Bar dataKey="earnings" radius={[8, 8, 0, 0]} maxBarSize={54}>
                      {series.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={entry.name === best?.name ? '#FF5C1A' : 'rgba(255,92,26,0.35)'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 4, minWidth: 0 }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              What made up your week
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {formatCurrency(totalBreakdown)} across {BREAKDOWN.length} sources
            </Typography>

            <Stack spacing={2} sx={{ mt: 2.5 }}>
              {BREAKDOWN.map((item) => {
                const share = Math.round((item.value / totalBreakdown) * 100);
                return (
                  <Box key={item.label}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {item.label}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {formatCurrency(item.value)}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={share}
                      color={item.tone}
                      sx={{ bgcolor: `${item.tone}.50` }}
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {share}% of the week
                    </Typography>
                  </Box>
                );
              })}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1.5 }}>
              <Chip
                size="small"
                icon={<TwoWheelerRoundedIcon />}
                label={`${mockHistory.length} jobs logged`}
                sx={{ fontWeight: 700 }}
              />
              <Chip
                size="small"
                icon={<RouteRoundedIcon />}
                label={formatDistance(totalDistance)}
                sx={{ fontWeight: 700 }}
              />
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Settlements */}
      <Card sx={{ borderRadius: 4 }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
            sx={{ flexWrap: 'wrap', gap: 1, mb: 1 }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Settlement history
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Weekly payouts land every Monday morning.
              </Typography>
            </Box>
            <Chip size="small" color="success" variant="outlined" label="Bank verified" sx={{ fontWeight: 700 }} />
          </Stack>

          <Alert severity="info" icon={<PaymentsRoundedIcon fontSize="small" />} sx={{ my: 2, borderRadius: 3 }}>
            {formatCurrency(pendingBalance)} is pending for the current cycle and will be transferred on the next payout
            date.
          </Alert>

          <Stack divider={<Divider />}>
            {PAYOUTS.map((payout) => (
              <Stack key={payout.id} direction="row" spacing={1.5} alignItems="center" sx={{ py: 1.5 }}>
                <Avatar sx={{ bgcolor: 'success.50', color: 'success.main', width: 40, height: 40 }}>
                  <AccountBalanceWalletRoundedIcon fontSize="small" />
                </Avatar>
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    {payout.id}
                  </Typography>
                  <Typography variant="caption" noWrap sx={{ color: 'text.secondary', display: 'block' }}>
                    {formatDate(payout.date)} · {payout.mode}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'success.main' }}>
                    +{formatCurrency(payout.amount)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {payout.status}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
