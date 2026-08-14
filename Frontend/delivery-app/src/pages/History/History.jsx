import React, { useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import RouteRoundedIcon from '@mui/icons-material/RouteRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import StatusChip from '../../components/StatusChip';
import { selectDeliveries, fetchDeliveries } from '../../redux/features/deliveriesSlice';
import { DELIVERY_STATUS } from '../../utils/deliveryConstants';
import { formatCurrency, formatDate, formatTime } from '../../utils/format';
import { formatDistance, formatDuration } from '../../utils/geo';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: DELIVERY_STATUS.DELIVERED, label: 'Delivered' },
  { value: DELIVERY_STATUS.CANCELLED, label: 'Cancelled' },
];

const RANGES = [
  { value: 'all', label: 'All' },
  { value: '1', label: 'Today' },
  { value: '7', label: '7 days' },
];

const withinRange = (value, days) => {
  if (days === 'all') return true;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (Number(days) - 1));
  return date.getTime() >= start.getTime();
};

const RatingStars = ({ value }) => {
  if (!value) {
    return (
      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
        Not rated
      </Typography>
    );
  }
  return (
    <Stack direction="row" spacing={0.25} alignItems="center">
      <StarRoundedIcon sx={{ fontSize: 16, color: 'warning.main' }} />
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {value}.0
      </Typography>
    </Stack>
  );
};

/** Card row used instead of the table below the md breakpoint. */
const HistoryCard = ({ row, onOpen }) => (
  <Card
    onClick={onOpen}
    sx={{
      borderRadius: 3.5,
      cursor: 'pointer',
      transition: 'transform 160ms ease, box-shadow 160ms ease',
      '&:active': { transform: 'scale(0.995)' },
    }}
  >
    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 800 }}>
            {row.customer}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {row.id} · {row.area}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'success.main' }}>
            {formatCurrency(row.payout)}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {formatDate(row.date)}
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ my: 1.25 }} />

      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', gap: 1 }}>
        <StatusChip status={row.status} />
        <Stack direction="row" spacing={0.4} alignItems="center">
          <RouteRoundedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            {formatDistance(row.distanceKm)}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.4} alignItems="center">
          <TimerOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            {formatDuration(row.durationMin)}
          </Typography>
        </Stack>
        {row.paymentMode === 'cod' && (
          <Chip
            size="small"
            icon={<PaymentsRoundedIcon />}
            label="COD"
            sx={{ height: 22, fontWeight: 800, bgcolor: 'warning.50', color: 'warning.dark' }}
          />
        )}
        <Box sx={{ flexGrow: 1 }} />
        <RatingStars value={row.rating} />
      </Stack>
    </CardContent>
  </Card>
);

export default function History() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const allDeliveries = useSelector(selectDeliveries);
  
  useEffect(() => {
    dispatch(fetchDeliveries());
  }, [dispatch]);
  
  // Only keep delivered and cancelled ones for history
  const historyDeliveries = useMemo(() => 
    allDeliveries.filter(d => d.status === DELIVERY_STATUS.DELIVERED || d.status === DELIVERY_STATUS.CANCELLED).map(d => ({
      ...d,
      date: new Date().toISOString(), // Mocking date since it's missing in some places
      durationMin: 20, // Mocking duration
      rating: d.status === DELIVERY_STATUS.DELIVERED ? 5 : null,
      customer: d.customer?.name || 'Unknown',
      area: d.drop?.landmark || 'Local Area',
    })), [allDeliveries]
  );

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [range, setRange] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return historyDeliveries.filter((row) => {
      const matchesTerm =
        !term ||
        [row.id, row.orderId, row.customer, row.area].join(' ').toLowerCase().includes(term);
      const matchesStatus = status === 'all' || row.status === status;
      return matchesTerm && matchesStatus && withinRange(row.date, range);
    });
  }, [query, status, range]);

  const totals = useMemo(
    () =>
      filtered.reduce(
        (acc, row) => ({
          payout: acc.payout + row.payout,
          distance: acc.distance + row.distanceKm,
        }),
        { payout: 0, distance: 0 },
      ),
    [filtered],
  );

  // Keep the current page valid when a filter shrinks the result set.
  const pageStart = Math.min(page, Math.max(0, Math.ceil(filtered.length / rowsPerPage) - 1)) * rowsPerPage;
  const visible = filtered.slice(pageStart, pageStart + rowsPerPage);

  const resetFilters = () => {
    setQuery('');
    setStatus('all');
    setRange('all');
    setPage(0);
  };

  return (
    <Box>
      <PageHeader
        icon={HistoryRoundedIcon}
        title="Delivery history"
        subtitle="Every completed and cancelled job, with payouts and ratings."
      />

      {/* Filters */}
      <Card sx={{ borderRadius: 4, mb: { xs: 2, md: 2.5 } }}>
        <CardContent sx={{ p: { xs: 1.75, sm: 2.25 } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr auto', md: '1fr 190px auto' },
              gap: 1.5,
              alignItems: 'center',
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Search by job ID, customer or area"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: query ? (
                  <InputAdornment position="end">
                    <IconButton size="small" aria-label="Clear search" onClick={() => setQuery('')}>
                      <CloseRoundedIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />

            <TextField
              select
              size="small"
              label="Status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 160 }}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <ToggleButtonGroup
              exclusive
              size="small"
              value={range}
              onChange={(_, value) => {
                if (!value) return;
                setRange(value);
                setPage(0);
              }}
              sx={{ justifySelf: { xs: 'stretch', md: 'end' } }}
            >
              {RANGES.map((option) => (
                <ToggleButton key={option.value} value={option.value} sx={{ px: 1.75 }}>
                  {option.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          <Divider sx={{ my: 1.75 }} />

          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              <b>{filtered.length}</b> jobs
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              <b>{formatCurrency(totals.payout)}</b> earned
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              <b>{formatDistance(totals.distance)}</b> ridden
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {!filtered.length ? (
        <Card sx={{ borderRadius: 4 }}>
          <EmptyState
            icon={HistoryRoundedIcon}
            title="No jobs match these filters"
            description="Try widening the date range or clearing the search."
            actionLabel="Reset filters"
            onAction={resetFilters}
          />
        </Card>
      ) : isDesktop ? (
        <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <TableContainer>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell>Job</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>When</TableCell>
                  <TableCell align="right">Trip</TableCell>
                  <TableCell align="right">Payout</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Rating</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visible.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/deliveries/${row.id}`)}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {row.id}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {row.orderId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {row.customer}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {row.area}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(row.date)}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {formatTime(row.date)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {formatDistance(row.distanceKm)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {formatDuration(row.durationMin)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>
                        {formatCurrency(row.payout)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {row.paymentMode === 'cod' ? 'COD' : 'Prepaid'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={row.status} />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <RatingStars value={row.rating} />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Divider />
          <TablePagination
            component="div"
            count={filtered.length}
            page={pageStart / rowsPerPage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[8, 16, 32]}
            onPageChange={(_, next) => setPage(next)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </Card>
      ) : (
        <>
          <Stack spacing={1.5}>
            {visible.map((row) => (
              <HistoryCard key={row.id} row={row} onOpen={() => navigate(`/deliveries/${row.id}`)} />
            ))}
          </Stack>
          <Card sx={{ borderRadius: 4, mt: 2 }}>
            <TablePagination
              component="div"
              count={filtered.length}
              page={pageStart / rowsPerPage}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[8, 16]}
              labelRowsPerPage="Per page"
              onPageChange={(_, next) => setPage(next)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
              sx={{ '& .MuiTablePagination-toolbar': { pl: 1.5, flexWrap: 'wrap' } }}
            />
          </Card>
        </>
      )}
    </Box>
  );
}
