import React, { useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  IconButton,
  Chip,
  Divider,
  Tabs,
  Tab,
  Badge,
  Collapse,
  Tooltip,
  TextField,
  InputAdornment,
  Avatar,
  Alert,
} from '@mui/material';
import TwoWheelerRoundedIcon from '@mui/icons-material/TwoWheelerRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import NearMeRoundedIcon from '@mui/icons-material/NearMeRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import RouteRoundedIcon from '@mui/icons-material/RouteRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import StatusChip from '../../components/StatusChip';
import DeliveryMap from '../../components/Map/DeliveryMap';
import useGeolocation from '../../hooks/useGeolocation';
import { PIN_COLORS } from '../../components/Map/mapIcons';
import {
  selectDeliveries,
  nextStatusOf,
  ACTION_LABELS,
  fetchDeliveries,
  acceptDeliveryThunk,
  rejectDeliveryThunk,
  updateDeliveryStatusThunk,
} from '../../redux/features/deliveriesSlice';
import { showToast } from '../../redux/features/uiSlice';
import { DELIVERY_STATUS, nextStopOf } from '../../utils/deliveryConstants';
import { formatCurrency, telHref } from '../../utils/format';
import { formatDistance, formatDuration, estimateMinutes, buildNavUrl } from '../../utils/geo';

const TABS = [
  { key: 'new', label: 'New requests', statuses: [DELIVERY_STATUS.NEW] },
  { key: 'accepted', label: 'Accepted', statuses: [DELIVERY_STATUS.ACCEPTED, DELIVERY_STATUS.PICKED_UP] },
  { key: 'transit', label: 'In transit', statuses: [DELIVERY_STATUS.IN_TRANSIT] },
];

/** One line of the pickup → drop timeline. */
const RouteLine = ({ kind, primary, secondary, isNext }) => (
  <Stack direction="row" spacing={1.5} alignItems="flex-start">
    <Stack alignItems="center" sx={{ pt: 0.25 }}>
      <Box
        sx={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          bgcolor: kind === 'pickup' ? PIN_COLORS.pickup : PIN_COLORS.drop,
          boxShadow: isNext ? `0 0 0 4px ${kind === 'pickup' ? 'rgba(33,121,245,0.18)' : 'rgba(255,92,26,0.18)'}` : 'none',
        }}
      >
        {kind === 'pickup' ? (
          <StorefrontRoundedIcon sx={{ fontSize: 15 }} />
        ) : (
          <HomeRoundedIcon sx={{ fontSize: 15 }} />
        )}
      </Box>
      {kind === 'pickup' && (
        <Box sx={{ width: 2, flexGrow: 1, minHeight: 18, my: 0.5, bgcolor: 'divider', borderRadius: 1 }} />
      )}
    </Stack>

    <Box sx={{ minWidth: 0, pb: kind === 'pickup' ? 0 : 0.5 }}>
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flexWrap: 'wrap' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {primary}
        </Typography>
        {isNext && (
          <Chip
            size="small"
            label="Next stop"
            sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800, bgcolor: 'primary.50', color: 'primary.dark' }}
          />
        )}
      </Stack>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.5 }}>
        {secondary}
      </Typography>
    </Box>
  </Stack>
);

const MetaChip = ({ icon: Icon, label }) => (
  <Stack
    direction="row"
    spacing={0.6}
    alignItems="center"
    sx={{
      px: 1,
      py: 0.4,
      borderRadius: 2,
      bgcolor: 'background.subtle',
      border: '1px solid',
      borderColor: 'divider',
    }}
  >
    <Icon sx={{ fontSize: 15, color: 'text.secondary' }} />
    <Typography variant="caption" sx={{ fontWeight: 700 }}>
      {label}
    </Typography>
  </Stack>
);

const DeliveryCard = ({ delivery, driver, onAccept, onReject, onAdvance, onOpen }) => {
  const dispatch = useDispatch();
  const [mapOpen, setMapOpen] = useState(false);
  const stop = nextStopOf(delivery);
  const isNew = delivery.status === DELIVERY_STATUS.NEW;
  const hasParcel = delivery.status === DELIVERY_STATUS.IN_TRANSIT;
  const rideMinutes = estimateMinutes(delivery.distanceKm);
  const itemCount = delivery.items.reduce((total, item) => total + item.qty, 0);

  const markers = useMemo(() => {
    const list = [];
    if (!hasParcel) {
      list.push({
        id: `${delivery.id}-pickup`,
        position: delivery.pickup.position,
        label: 'P',
        color: PIN_COLORS.pickup,
        title: delivery.pickup.name,
        subtitle: delivery.pickup.address,
      });
    }
    list.push({
      id: `${delivery.id}-drop`,
      position: delivery.drop.position,
      label: 'D',
      color: PIN_COLORS.drop,
      title: delivery.customer.name,
      subtitle: delivery.drop.address,
    });
    return list;
  }, [delivery, hasParcel]);

  const routeWaypoints = useMemo(
    () => [driver, ...markers.map((marker) => marker.position)].filter(Boolean),
    [driver, markers],
  );

  return (
    <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
        {/* Header */}
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Avatar
            sx={{
              width: 42,
              height: 42,
              bgcolor: 'primary.50',
              color: 'primary.main',
              display: { xs: 'none', sm: 'flex' },
            }}
          >
            <TwoWheelerRoundedIcon fontSize="small" />
          </Avatar>

          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                {delivery.customer.name}
              </Typography>
              <StatusChip status={delivery.status} />
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {delivery.id} · {delivery.orderId} · {delivery.placedAtLabel}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'success.main', lineHeight: 1.2 }}>
              {formatCurrency(delivery.payout)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              payout
            </Typography>
          </Box>
        </Stack>

        {/* Route */}
        <Stack spacing={0} sx={{ mb: 2 }}>
          <RouteLine
            kind="pickup"
            primary={delivery.pickup.name}
            secondary={delivery.pickup.address}
            isNext={stop.kind === 'pickup'}
          />
          <RouteLine
            kind="drop"
            primary={delivery.drop.landmark || 'Customer address'}
            secondary={delivery.drop.address}
            isNext={stop.kind === 'drop'}
          />
        </Stack>

        {/* Meta */}
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
          <MetaChip icon={RouteRoundedIcon} label={formatDistance(delivery.distanceKm)} />
          <MetaChip icon={TimerOutlinedIcon} label={`~${formatDuration(rideMinutes)}`} />
          <MetaChip icon={ShoppingBagRoundedIcon} label={`${itemCount} items`} />
          <MetaChip
            icon={PaymentsRoundedIcon}
            label={
              delivery.paymentMode === 'cod'
                ? `Collect ${formatCurrency(delivery.orderValue)}`
                : `Prepaid ${formatCurrency(delivery.orderValue)}`
            }
          />
        </Stack>

        {delivery.paymentMode === 'cod' && (
          <Alert severity="warning" icon={<PaymentsRoundedIcon fontSize="small" />} sx={{ mb: 2, borderRadius: 3, py: 0.25 }}>
            Cash on delivery — collect {formatCurrency(delivery.orderValue)} from the customer.
          </Alert>
        )}

        {/* Inline map */}
        <Collapse in={mapOpen} unmountOnExit>
          <Box sx={{ mb: 2 }}>
            <DeliveryMap
              height={{ xs: 220, sm: 260 }}
              driver={driver}
              markers={markers}
              route={routeWaypoints.length >= 2 ? routeWaypoints : null}
              fitAll
              compact
            />
          </Box>
        </Collapse>

        <Divider sx={{ mb: 1.75 }} />

        {/* Actions */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 1,
          }}
        >
          <Stack direction="row" spacing={0.75} sx={{ flexShrink: 0 }}>
            <Tooltip title={`Call ${delivery.customer.name}`}>
              <IconButton
                size="small"
                component="a"
                href={telHref(delivery.customer.phone)}
                sx={{ bgcolor: 'success.50', color: 'success.main' }}
              >
                <PhoneRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Open in navigation app">
              <IconButton
                size="small"
                component="a"
                href={buildNavUrl(stop.position, driver)}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ bgcolor: 'secondary.50', color: 'secondary.main' }}
              >
                <NearMeRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={mapOpen ? 'Hide map' : 'Show map'}>
              <IconButton
                size="small"
                onClick={() => setMapOpen((open) => !open)}
                sx={{
                  bgcolor: mapOpen ? 'primary.50' : 'background.subtle',
                  color: mapOpen ? 'primary.main' : 'text.secondary',
                }}
              >
                <MapRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          <Box sx={{ flexGrow: 1 }} />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <Button size="small" onClick={onOpen} endIcon={<ArrowForwardRoundedIcon />} sx={{ order: { xs: 3, sm: 1 } }}>
              Details
            </Button>

            {isNew && (
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(rejectDeliveryThunk(delivery.id));
                }}
                startIcon={<CloseRoundedIcon />}
                sx={{ order: { xs: 2, sm: 2 } }}
              >
                Decline
              </Button>
            )}

            {nextStatusOf(delivery.status) && (
              <Button
                size="small"
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  const next = nextStatusOf(delivery.status);
                  if (delivery.status === DELIVERY_STATUS.NEW) {
                    dispatch(acceptDeliveryThunk(delivery.id));
                  } else if (next) {
                    dispatch(updateDeliveryStatusThunk({ orderId: delivery.id, status: next }));
                  }
                }}
                startIcon={<CheckCircleRoundedIcon />}
                sx={{ order: { xs: 1, sm: 3 } }}
              >
                {ACTION_LABELS[delivery.status]}
              </Button>
            )}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default function Deliveries() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const deliveries = useSelector(selectDeliveries);
  const [tab, setTab] = useState(0);
  const [query, setQuery] = useState('');

  useEffect(() => {
    dispatch(fetchDeliveries());
  }, [dispatch]);

  useEffect(() => {
    console.log("[Order Flow Debug] Delivery Orders Data Updated:", deliveries);
  }, [deliveries]);

  const { coords, position } = useGeolocation({ watch: false });
  const driver = position || coords;

  const counts = useMemo(
    () =>
      TABS.map((entry) => deliveries.filter((delivery) => entry.statuses.includes(delivery.status)).length),
    [deliveries],
  );

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return deliveries
      .filter((delivery) => TABS[tab].statuses.includes(delivery.status))
      .filter((delivery) => {
        if (!term) return true;
        return [
          delivery.id,
          delivery.orderId,
          delivery.customer.name,
          delivery.pickup.name,
          delivery.drop.address,
        ]
          .join(' ')
          .toLowerCase()
          .includes(term);
      });
  }, [deliveries, tab, query]);

  const handleAccept = (delivery) => {
    dispatch(acceptDelivery(delivery.id));
    dispatch(showToast({ message: `${delivery.id} accepted — head to ${delivery.pickup.name}`, severity: 'success' }));
    setTab(1);
  };

  const handleReject = (delivery) => {
    dispatch(rejectDelivery(delivery.id));
    dispatch(showToast({ message: `${delivery.id} declined`, severity: 'info' }));
  };

  const handleAdvance = (delivery) => {
    const next = nextStatusOf(delivery.status);
    dispatch(advanceDelivery(delivery.id));
    if (next === DELIVERY_STATUS.DELIVERED) {
      dispatch(
        showToast({ message: `${delivery.id} delivered · ${formatCurrency(delivery.payout)} earned`, severity: 'success' }),
      );
    } else if (next === DELIVERY_STATUS.IN_TRANSIT) {
      dispatch(showToast({ message: 'On the way to the customer', severity: 'info' }));
      setTab(2);
    } else {
      dispatch(showToast({ message: 'Parcel collected', severity: 'success' }));
    }
  };

  return (
    <Box>
      <PageHeader
        icon={TwoWheelerRoundedIcon}
        title="Deliveries"
        subtitle="Accept jobs, follow the route and update each stop as you go."
        actions={
          <Button variant="contained" startIcon={<MapRoundedIcon />} onClick={() => navigate('/map')}>
            Live map
          </Button>
        }
      />

      <Card sx={{ borderRadius: 4, mb: { xs: 2, md: 2.5 } }}>
        <Box sx={{ px: { xs: 1, sm: 2 }, pt: 1 }}>
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            {TABS.map((entry, index) => (
              <Tab
                key={entry.key}
                label={
                  <Badge
                    color="primary"
                    badgeContent={counts[index]}
                    max={99}
                    sx={{ '& .MuiBadge-badge': { right: -14, top: 2 } }}
                  >
                    <Box component="span" sx={{ pr: counts[index] ? 1.75 : 0 }}>
                      {entry.label}
                    </Box>
                  </Badge>
                }
              />
            ))}
          </Tabs>
        </Box>
        <Divider />
        <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by job ID, customer or store"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: query ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setQuery('')} aria-label="Clear search">
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </Box>
      </Card>

      {!visible.length ? (
        <Card sx={{ borderRadius: 4 }}>
          <EmptyState
            icon={TwoWheelerRoundedIcon}
            title={query ? 'No jobs match that search' : `Nothing in ${TABS[tab].label.toLowerCase()}`}
            description={
              query
                ? 'Try a different job ID, customer name or store.'
                : 'New jobs land here the moment dispatch assigns them to you.'
            }
            actionLabel={query ? 'Clear search' : undefined}
            onAction={query ? () => setQuery('') : undefined}
          />
        </Card>
      ) : (
        <Stack spacing={{ xs: 2, md: 2.5 }}>
          {visible.map((delivery) => (
            <DeliveryCard
              key={delivery.id}
              delivery={delivery}
              driver={driver}
              onAccept={() => handleAccept(delivery)}
              onReject={() => handleReject(delivery)}
              onAdvance={() => handleAdvance(delivery)}
              onOpen={() => navigate(`/deliveries/${delivery.id}`)}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
