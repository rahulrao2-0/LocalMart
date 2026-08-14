import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Card,
  Typography,
  Stack,
  Chip,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Alert,
  Autocomplete,
  TextField,
  CircularProgress,
  Divider,
  Tooltip,
  Collapse,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import NearMeRoundedIcon from '@mui/icons-material/NearMeRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import GpsFixedRoundedIcon from '@mui/icons-material/GpsFixedRounded';
import GpsOffRoundedIcon from '@mui/icons-material/GpsOffRounded';
import RouteRoundedIcon from '@mui/icons-material/RouteRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import StatusChip from '../../components/StatusChip';
import DeliveryMap from '../../components/Map/DeliveryMap';
import useGeolocation from '../../hooks/useGeolocation';
import { PIN_COLORS } from '../../components/Map/mapIcons';
import { selectDeliveries } from '../../redux/features/deliveriesSlice';
import {
  getActiveDeliveries,
  nextStopOf,
  DELIVERY_STATUS,
} from '../../utils/deliveryConstants';
import {
  formatDistance,
  formatDuration,
  etaClock,
  searchPlaces,
  orderByProximity,
  buildNavUrl,
} from '../../utils/geo';
import { formatCurrency } from '../../utils/format';

// Height of the map viewport: subtract the app chrome from the visual viewport.
// 100svh keeps mobile browser toolbars from cropping the bottom of the map.
const MAP_HEIGHT = {
  xs: 'max(380px, calc(100svh - 60px - 16px - 92px))',
  md: 'max(460px, calc(100svh - 68px - 20px - 32px - 82px))',
};

const StopRow = ({ index, kind, title, subtitle, meta, onNavigate }) => (
  <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ py: 1.25 }}>
    <Box
      sx={{
        width: 28,
        height: 28,
        flexShrink: 0,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        fontSize: '0.72rem',
        fontWeight: 800,
        color: '#fff',
        bgcolor: kind === 'pickup' ? PIN_COLORS.pickup : PIN_COLORS.drop,
      }}
    >
      {index}
    </Box>
    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
      <Stack direction="row" spacing={0.75} alignItems="center">
        {kind === 'pickup' ? (
          <StorefrontRoundedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
        ) : (
          <HomeRoundedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
        )}
        <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
      </Stack>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.45 }}>
        {subtitle}
      </Typography>
      {meta && (
        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
          {meta}
        </Typography>
      )}
    </Box>
    {onNavigate && (
      <Tooltip title="Open in maps">
        <IconButton size="small" onClick={onNavigate}>
          <NearMeRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    )}
  </Stack>
);

export default function LiveMap() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isOnDuty = useSelector((state) => state.ui.isOnDuty);
  const deliveries = useSelector(selectDeliveries);
  const [searchParams, setSearchParams] = useSearchParams();

  const active = useMemo(() => getActiveDeliveries(deliveries), [deliveries]);
  const jobParam = searchParams.get('job');

  const [mode, setMode] = useState(jobParam ? 'single' : 'all');
  const [selectedId, setSelectedId] = useState(jobParam || active[0]?.id || null);
  const [follow, setFollow] = useState(false);
  const [summary, setSummary] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);

  // Address search (Nominatim)
  const [searchInput, setSearchInput] = useState('');
  const [options, setOptions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchMarker, setSearchMarker] = useState(null);

  const { coords, position, accuracy, trail, error: geoError, status, refresh } = useGeolocation({
    watch: true,
    enabled: true,
  });

  const selected = active.find((delivery) => delivery.id === selectedId) || null;

  // Debounced place lookup.
  useEffect(() => {
    const query = searchInput.trim();
    if (query.length < 3) {
      setOptions([]);
      return undefined;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setSearching(true);
      searchPlaces(query, { signal: controller.signal })
        .then(setOptions)
        .catch(() => setOptions([]))
        .finally(() => setSearching(false));
    }, 450);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchInput]);

  const handleSelectJob = (id) => {
    setSelectedId(id);
    setMode('single');
    setSummary(null);
    setSearchParams(id ? { job: id } : {}, { replace: true });
    if (!isDesktop) setSheetOpen(false);
  };

  const handleMode = (_, next) => {
    if (!next) return;
    setMode(next);
    setSummary(null);
    if (next === 'all') setSearchParams({}, { replace: true });
  };

  // Waypoints fed to the routing layer.
  const routeWaypoints = useMemo(() => {
    if (mode === 'single') {
      if (!selected) return null;
      const legs = [coords];
      // Skip the store once the parcel is on board.
      if (selected.status !== DELIVERY_STATUS.IN_TRANSIT) legs.push(selected.pickup.position);
      legs.push(selected.drop.position);
      return legs;
    }

    const stops = active.map((delivery) => nextStopOf(delivery)).filter((s) => s?.position);
    if (!stops.length) return null;
    // OSRM's demo server is happier with short waypoint lists.
    return [coords, ...orderByProximity(coords, stops).slice(0, 8).map((s) => s.position)];
  }, [mode, selected, active, coords]);

  const markers = useMemo(() => {
    const list = [];

    if (mode === 'single' && selected) {
      if (selected.status !== DELIVERY_STATUS.IN_TRANSIT) {
        list.push({
          id: `${selected.id}-pickup`,
          position: selected.pickup.position,
          label: 'P',
          color: PIN_COLORS.pickup,
          title: selected.pickup.name,
          subtitle: selected.pickup.address,
          meta: 'Pickup',
        });
      }
      list.push({
        id: `${selected.id}-drop`,
        position: selected.drop.position,
        label: 'D',
        color: PIN_COLORS.drop,
        title: selected.customer.name,
        subtitle: selected.drop.address,
        meta: `Drop · ${formatCurrency(selected.payout)} payout`,
      });
    } else {
      const stops = orderByProximity(coords, active.map((delivery) => ({ ...nextStopOf(delivery), delivery })));
      stops.forEach((stop, index) => {
        list.push({
          id: `${stop.delivery.id}-${stop.kind}`,
          position: stop.position,
          label: index + 1,
          color: stop.kind === 'pickup' ? PIN_COLORS.pickup : PIN_COLORS.drop,
          title: stop.kind === 'pickup' ? stop.name : stop.delivery.customer.name,
          subtitle: stop.address,
          meta: `${stop.delivery.id} · ${stop.kind === 'pickup' ? 'Pickup' : 'Drop'}`,
          deliveryId: stop.delivery.id,
        });
      });
    }

    if (searchMarker) {
      list.push({
        id: 'search-result',
        position: { lat: searchMarker.lat, lng: searchMarker.lng },
        label: '★',
        color: PIN_COLORS.neutral,
        title: 'Search result',
        subtitle: searchMarker.label,
      });
    }

    return list;
  }, [mode, selected, active, coords, searchMarker]);

  const orderedStops = useMemo(
    () => orderByProximity(coords, active.map((delivery) => ({ ...nextStopOf(delivery), delivery }))),
    [active, coords],
  );

  const handleRoute = useCallback((result) => setSummary(result), []);

  const panel = (
    <Stack sx={{ height: '100%', minHeight: 0 }}>
      <Box sx={{ p: 2, pb: 1.5 }}>
        <Autocomplete
          freeSolo
          size="small"
          options={options}
          filterOptions={(x) => x}
          getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
          loading={searching}
          onInputChange={(_, value) => setSearchInput(value)}
          onChange={(_, value) => {
            if (value && typeof value !== 'string') {
              setSearchMarker(value);
              mapInstance?.setView([value.lat, value.lng], 16, { animate: true });
            }
          }}
          noOptionsText={searchInput.length < 3 ? 'Type at least 3 characters' : 'No places found'}
          renderInput={(params) => {
            const { InputProps, ...otherParams } = params || {};
            const safeInputProps = InputProps || {};
            return (
              <TextField
                {...otherParams}
                placeholder="Search an address or landmark"
                InputProps={{
                  ...safeInputProps,
                  startAdornment: (
                    <>
                      <SearchRoundedIcon sx={{ fontSize: 19, color: 'text.disabled', mr: 1 }} />
                      {safeInputProps.startAdornment}
                    </>
                  ),
                  endAdornment: (
                    <>
                      {searching ? <CircularProgress size={16} /> : null}
                      {safeInputProps.endAdornment}
                    </>
                  ),
                }}
              />
            );
          }}
        />
      </Box>

      <Box sx={{ px: 2, pb: 1.5 }}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleMode}
          size="small"
          fullWidth
          sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600, py: 0.6 } }}
        >
          <ToggleButton value="all">
            <RouteRoundedIcon sx={{ fontSize: 17, mr: 0.75 }} />
            All stops
          </ToggleButton>
          <ToggleButton value="single" disabled={!active.length}>
            <NearMeRoundedIcon sx={{ fontSize: 17, mr: 0.75 }} />
            One job
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Divider />

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 2, py: 1 }}>
        {!active.length ? (
          <EmptyState
            dense
            icon={MapRoundedIcon}
            title="No active jobs"
            description={
              isOnDuty
                ? 'Accept a delivery request and its route will appear here.'
                : 'You are offline. Go online from the top bar to receive jobs.'
            }
            actionLabel="View requests"
            onAction={() => navigate('/deliveries')}
          />
        ) : mode === 'single' ? (
          <>
            <Typography variant="overline" sx={{ color: 'text.disabled' }}>
              Active jobs
            </Typography>
            <Stack spacing={1} sx={{ mb: 2 }}>
              {active.map((delivery) => {
                const isSelected = delivery.id === selectedId;
                return (
                  <Card
                    key={delivery.id}
                    onClick={() => handleSelectJob(delivery.id)}
                    sx={{
                      p: 1.5,
                      cursor: 'pointer',
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      bgcolor: isSelected ? 'primary.50' : 'background.paper',
                      transition: 'all .15s ease',
                      '&:hover': { borderColor: 'primary.300' },
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        {delivery.id}
                      </Typography>
                      <StatusChip status={delivery.status} />
                    </Stack>
                    <Typography variant="caption" noWrap sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                      {delivery.customer.name} · {delivery.drop.address.split(',')[0]}
                    </Typography>
                  </Card>
                );
              })}
            </Stack>

            {selected && (
              <>
                <Typography variant="overline" sx={{ color: 'text.disabled' }}>
                  Route
                </Typography>
                <Box sx={{ mb: 1 }}>
                  {selected.status !== DELIVERY_STATUS.IN_TRANSIT && (
                    <StopRow
                      index={1}
                      kind="pickup"
                      title={selected.pickup.name}
                      subtitle={selected.pickup.address}
                      onNavigate={() =>
                        window.open(buildNavUrl(selected.pickup.position, position), '_blank', 'noopener')
                      }
                    />
                  )}
                  <StopRow
                    index={selected.status !== DELIVERY_STATUS.IN_TRANSIT ? 2 : 1}
                    kind="drop"
                    title={selected.customer.name}
                    subtitle={`${selected.drop.address}${selected.drop.landmark ? ` · ${selected.drop.landmark}` : ''}`}
                    meta={`${formatCurrency(selected.payout)} payout${selected.paymentMode === 'cod' ? ` · collect ${formatCurrency(selected.orderValue)}` : ''}`}
                    onNavigate={() =>
                      window.open(buildNavUrl(selected.drop.position, position), '_blank', 'noopener')
                    }
                  />
                </Box>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate(`/deliveries/${selected.id}`)}
                  sx={{ mt: 1 }}
                >
                  Open job details
                </Button>
              </>
            )}
          </>
        ) : (
          <>
            <Typography variant="overline" sx={{ color: 'text.disabled' }}>
              Optimised order · {orderedStops.length} stops
            </Typography>
            {orderedStops.map((stop, index) => (
              <Box
                key={`${stop.delivery.id}-${stop.kind}`}
                onClick={() => handleSelectJob(stop.delivery.id)}
                sx={{ cursor: 'pointer', borderBottom: '1px solid', borderColor: 'divider', '&:last-of-type': { borderBottom: 0 } }}
              >
                <StopRow
                  index={index + 1}
                  kind={stop.kind}
                  title={stop.kind === 'pickup' ? stop.name : stop.delivery.customer.name}
                  subtitle={stop.address}
                  meta={`${stop.delivery.id} · ${stop.kind === 'pickup' ? 'Pickup' : 'Drop'}`}
                  onNavigate={() => window.open(buildNavUrl(stop.position, position), '_blank', 'noopener')}
                />
              </Box>
            ))}
          </>
        )}
      </Box>

      <Divider />
      <Box sx={{ p: 1.5 }}>
        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', lineHeight: 1.4 }}>
          Maps © OpenStreetMap contributors · routing by OSRM. Free public services, no API key.
        </Typography>
      </Box>
    </Stack>
  );

  return (
    <Box>
      <PageHeader
        icon={MapRoundedIcon}
        title="Live map"
        subtitle="Track your position and follow the road route to every stop."
        sx={{ display: { xs: 'none', md: 'flex' } }}
        actions={
          <>
            <Tooltip title={follow ? 'Stop following me' : 'Keep map centred on me'}>
              <Button
                variant={follow ? 'contained' : 'outlined'}
                startIcon={follow ? <GpsFixedRoundedIcon /> : <GpsOffRoundedIcon />}
                onClick={() => setFollow((prev) => !prev)}
              >
                {follow ? 'Following' : 'Follow me'}
              </Button>
            </Tooltip>
            <Tooltip title="Refresh GPS fix">
              <IconButton onClick={refresh} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <RefreshRoundedIcon />
              </IconButton>
            </Tooltip>
          </>
        }
      />

      {geoError && (
        <Alert
          severity="warning"
          onClose={undefined}
          action={
            <Button size="small" color="inherit" onClick={refresh}>
              Retry
            </Button>
          }
          sx={{ mb: 2, borderRadius: 3 }}
        >
          {geoError} Showing Bengaluru as a fallback centre.
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '350px 1fr' },
          gap: { xs: 0, md: 2 },
          height: MAP_HEIGHT,
        }}
      >
        <Card sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
          {panel}
        </Card>

        <Box sx={{ position: 'relative', minHeight: 0 }}>
          <DeliveryMap
            height="100%"
            driver={position || coords}
            accuracy={accuracy}
            markers={markers}
            route={routeWaypoints}
            trail={trail}
            onRoute={handleRoute}
            follow={follow}
            fitAll={!follow}
            onReady={setMapInstance}
            onMarkerClick={(marker) => marker.deliveryId && handleSelectJob(marker.deliveryId)}
            sx={{ borderRadius: { xs: 3, md: 3 } }}
          >
            {/* Route summary — floats over the map on every breakpoint. */}
            <Card
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                right: { xs: 12, sm: 'auto' },
                zIndex: 500,
                px: 1.75,
                py: 1.25,
                minWidth: { sm: 240 },
                bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(19,28,46,0.92)' : 'rgba(255,255,255,0.94)'),
                backdropFilter: 'blur(8px)',
                boxShadow: (t) => t.customShadows.sm,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center" divider={<Divider orientation="vertical" flexItem />}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Distance
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    {summary ? formatDistance(summary.distanceKm) : '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Ride time
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    {summary ? formatDuration(summary.durationMin) : '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    ETA
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    {summary ? etaClock(summary.durationMin) : '—'}
                  </Typography>
                </Box>
              </Stack>
              {summary?.isEstimate && (
                <Typography variant="caption" sx={{ color: 'warning.dark', display: 'block', mt: 0.5 }}>
                  Straight-line estimate — live routing unavailable.
                </Typography>
              )}
              {status === 'locating' && !position && (
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                  Getting your GPS fix…
                </Typography>
              )}
            </Card>

            {/* Mobile controls */}
            <Stack
              spacing={1}
              sx={{ position: 'absolute', left: 12, bottom: 96, zIndex: 500, display: { xs: 'flex', md: 'none' } }}
            >
              <Chip
                icon={follow ? <GpsFixedRoundedIcon /> : <GpsOffRoundedIcon />}
                label={follow ? 'Following' : 'Follow me'}
                onClick={() => setFollow((prev) => !prev)}
                color={follow ? 'primary' : 'default'}
                sx={{ bgcolor: follow ? undefined : 'background.paper', fontWeight: 700 }}
              />
            </Stack>
          </DeliveryMap>

          {/* Mobile bottom sheet holding the same panel content. */}
          <Card
            sx={{
              display: { xs: 'block', md: 'none' },
              position: 'absolute',
              left: 8,
              right: 8,
              bottom: 8,
              zIndex: 600,
              overflow: 'hidden',
              boxShadow: (t) => t.customShadows.lg,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              onClick={() => setSheetOpen((prev) => !prev)}
              sx={{ px: 2, py: 1.25, cursor: 'pointer' }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <RouteRoundedIcon sx={{ fontSize: 19, color: 'primary.main' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  {active.length ? `${active.length} active ${active.length === 1 ? 'job' : 'jobs'}` : 'No active jobs'}
                </Typography>
                {summary && (
                  <Chip size="small" label={`${formatDistance(summary.distanceKm)} · ${formatDuration(summary.durationMin)}`} />
                )}
              </Stack>
              <IconButton size="small">
                {sheetOpen ? <ExpandMoreRoundedIcon /> : <ExpandLessRoundedIcon />}
              </IconButton>
            </Stack>
            <Collapse in={sheetOpen}>
              <Divider />
              <Box sx={{ maxHeight: '46svh', display: 'flex', flexDirection: 'column' }}>{panel}</Box>
            </Collapse>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
