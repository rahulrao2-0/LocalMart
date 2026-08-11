import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  IconButton,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Alert,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import NearMeRoundedIcon from '@mui/icons-material/NearMeRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import RouteRoundedIcon from '@mui/icons-material/RouteRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import EmptyState from '../../components/EmptyState';
import StatusChip from '../../components/StatusChip';
import DeliveryMap from '../../components/Map/DeliveryMap';
import useGeolocation from '../../hooks/useGeolocation';
import { PIN_COLORS } from '../../components/Map/mapIcons';
import {
  selectDeliveries,
  acceptDelivery,
  rejectDelivery,
  advanceDelivery,
  nextStatusOf,
  ACTION_LABELS,
} from '../../redux/features/deliveriesSlice';
import { showToast } from '../../redux/features/uiSlice';
import { DELIVERY_STATUS, DELIVERY_STAGES, STATUS_META, nextStopOf } from '../../data/mockDeliveries';
import { formatCurrency, telHref } from '../../utils/format';
import {
  formatDistance,
  formatDuration,
  etaClock,
  buildNavUrl,
  estimateMinutes,
} from '../../utils/geo';

/** Address block with call + navigate actions, used for both ends of the trip. */
const PlaceCard = ({ kind, title, address, landmark, phone, position, driver, dimmed }) => (
  <Card sx={{ borderRadius: 4, opacity: dimmed ? 0.6 : 1 }}>
    <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box
          sx={{
            width: 38,
            height: 38,
            flexShrink: 0,
            borderRadius: 2.5,
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            bgcolor: kind === 'pickup' ? PIN_COLORS.pickup : PIN_COLORS.drop,
          }}
        >
          {kind === 'pickup' ? <StorefrontRoundedIcon fontSize="small" /> : <HomeRoundedIcon fontSize="small" />}
        </Box>

        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.08em' }}>
            {kind === 'pickup' ? 'Pickup' : 'Drop'}
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.3 }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {address}
          </Typography>
          {landmark && (
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, display: 'block', mt: 0.5 }}>
              {landmark}
            </Typography>
          )}
        </Box>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        {phone && (
          <Button
            fullWidth
            size="small"
            variant="outlined"
            component="a"
            href={telHref(phone)}
            startIcon={<PhoneRoundedIcon />}
          >
            Call
          </Button>
        )}
        <Button
          fullWidth
          size="small"
          variant="contained"
          component="a"
          href={buildNavUrl(position, driver)}
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<NearMeRoundedIcon />}
        >
          Navigate
        </Button>
      </Stack>
    </CardContent>
  </Card>
);

const FactRow = ({ icon: Icon, label, value, tone = 'primary' }) => (
  <Stack direction="row" spacing={1.5} alignItems="center">
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
    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
        {value}
      </Typography>
    </Box>
  </Stack>
);

export default function DeliveryDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const deliveries = useSelector(selectDeliveries);
  const delivery = deliveries.find((item) => item.id === id) || null;

  const [follow, setFollow] = useState(false);
  const [routeSummary, setRouteSummary] = useState(null);

  const { coords, position, accuracy, trail, error: geoError } = useGeolocation({ watch: true });
  const driver = position || coords;

  const hasParcel = delivery?.status === DELIVERY_STATUS.IN_TRANSIT;
  const isFinished =
    delivery?.status === DELIVERY_STATUS.DELIVERED || delivery?.status === DELIVERY_STATUS.CANCELLED;

  const markers = useMemo(() => {
    if (!delivery) return [];
    const list = [];
    // Once the parcel is on board the store is no longer part of the trip.
    if (!hasParcel) {
      list.push({
        id: `${delivery.id}-pickup`,
        position: delivery.pickup.position,
        label: 'P',
        color: PIN_COLORS.pickup,
        title: delivery.pickup.name,
        subtitle: delivery.pickup.address,
        meta: 'Pickup',
      });
    }
    list.push({
      id: `${delivery.id}-drop`,
      position: delivery.drop.position,
      label: 'D',
      color: PIN_COLORS.drop,
      title: delivery.customer.name,
      subtitle: delivery.drop.address,
      meta: `Drop · ${formatCurrency(delivery.payout)} payout`,
    });
    return list;
  }, [delivery, hasParcel]);

  const routeWaypoints = useMemo(
    () => [driver, ...markers.map((marker) => marker.position)].filter(Boolean),
    [driver, markers],
  );

  if (!delivery) {
    return (
      <Box>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate('/deliveries')} sx={{ mb: 2 }}>
          Back to deliveries
        </Button>
        <Card sx={{ borderRadius: 4 }}>
          <EmptyState
            icon={SearchOffRoundedIcon}
            title="Job not found"
            description={`${id} isn't on your board anymore — it may have been declined or reassigned.`}
            actionLabel="View open jobs"
            onAction={() => navigate('/deliveries')}
          />
        </Card>
      </Box>
    );
  }

  const stop = nextStopOf(delivery);
  const stageIndex = DELIVERY_STAGES.indexOf(delivery.status);
  const activeStep = delivery.status === DELIVERY_STATUS.NEW ? 0 : Math.max(0, stageIndex);
  const rideMinutes = routeSummary?.durationMin ?? estimateMinutes(delivery.distanceKm);
  const rideDistance = routeSummary?.distanceKm ?? delivery.distanceKm;
  const nextStatus = nextStatusOf(delivery.status);

  const handlePrimary = () => {
    if (delivery.status === DELIVERY_STATUS.NEW) {
      dispatch(acceptDelivery(delivery.id));
      dispatch(showToast({ message: `Accepted — head to ${delivery.pickup.name}`, severity: 'success' }));
      return;
    }
    dispatch(advanceDelivery(delivery.id));
    dispatch(
      showToast({
        message:
          nextStatus === DELIVERY_STATUS.DELIVERED
            ? `Delivered · ${formatCurrency(delivery.payout)} earned`
            : `Status updated to ${STATUS_META[nextStatus]?.label || nextStatus}`,
        severity: 'success',
      }),
    );
  };

  const handleDecline = () => {
    dispatch(rejectDelivery(delivery.id));
    dispatch(showToast({ message: `${delivery.id} declined`, severity: 'info' }));
    navigate('/deliveries');
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
          mb: { xs: 2.5, md: 3 },
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
          <IconButton onClick={() => navigate('/deliveries')} sx={{ bgcolor: 'background.subtle' }}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {delivery.id}
              </Typography>
              <StatusChip status={delivery.status} />
            </Stack>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {delivery.orderId} · placed {delivery.placedAtLabel}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
          <Button
            variant="outlined"
            startIcon={<MapRoundedIcon />}
            onClick={() => navigate(`/map?job=${delivery.id}`)}
            sx={{ flexGrow: { xs: 1, sm: 0 }, whiteSpace: 'nowrap' }}
          >
            Live map
          </Button>
          {nextStatus && (
            <Button
              variant="contained"
              startIcon={<CheckCircleRoundedIcon />}
              onClick={handlePrimary}
              sx={{ flexGrow: { xs: 1, sm: 0 }, whiteSpace: 'nowrap', display: { xs: 'none', sm: 'inline-flex' } }}
            >
              {ACTION_LABELS[delivery.status]}
            </Button>
          )}
        </Stack>
      </Box>

      {/* Progress */}
      <Card sx={{ borderRadius: 4, mb: { xs: 2, md: 2.5 } }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{
              '& .MuiStepLabel-label': { fontSize: { xs: '0.68rem', sm: '0.8rem' }, mt: 0.75, fontWeight: 700 },
              '& .MuiStepConnector-line': { borderTopWidth: 2 },
            }}
          >
            {DELIVERY_STAGES.map((stage) => (
              <Step key={stage} completed={stageIndex > DELIVERY_STAGES.indexOf(stage)}>
                <StepLabel>{STATUS_META[stage].label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {delivery.status === DELIVERY_STATUS.NEW && (
            <Alert severity="info" sx={{ mt: 2, borderRadius: 3 }}>
              Accept this job to start the run — it stays open to other partners until you do.
            </Alert>
          )}
          {isFinished && (
            <Alert severity="success" sx={{ mt: 2, borderRadius: 3 }}>
              This job is closed. {formatCurrency(delivery.payout)} was added to today's earnings.
            </Alert>
          )}
        </CardContent>
      </Card>

      {geoError && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 3 }}>
          {geoError} — the route starts from the store instead of your live position.
        </Alert>
      )}

      {/* Map + trip summary */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.5fr 1fr' },
          gap: { xs: 2, md: 2.5 },
          mb: { xs: 2, md: 2.5 },
        }}
      >
        <Card sx={{ borderRadius: 4, overflow: 'hidden', minWidth: 0 }}>
          <Box sx={{ p: { xs: 1.25, sm: 1.5 } }}>
            <DeliveryMap
              height={{ xs: 300, sm: 360, lg: 430 }}
              driver={driver}
              accuracy={accuracy}
              markers={markers}
              route={routeWaypoints.length >= 2 ? routeWaypoints : null}
              trail={trail}
              follow={follow}
              fitAll={!follow}
              onRoute={setRouteSummary}
            />
          </Box>
          <Box sx={{ px: { xs: 2, sm: 2.5 }, pb: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Chip
                size="small"
                clickable
                onClick={() => setFollow((value) => !value)}
                color={follow ? 'primary' : 'default'}
                variant={follow ? 'filled' : 'outlined'}
                icon={<NearMeRoundedIcon />}
                label={follow ? 'Following you' : 'Follow me'}
              />
              {routeSummary?.isEstimate && (
                <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 700 }}>
                  Straight-line estimate — routing service unreachable
                </Typography>
              )}
            </Stack>
          </Box>
        </Card>

        <Stack spacing={{ xs: 2, md: 2.5 }} sx={{ minWidth: 0 }}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
                Trip summary
              </Typography>
              <Stack spacing={1.75}>
                <FactRow icon={RouteRoundedIcon} label="Distance" value={formatDistance(rideDistance)} />
                <FactRow
                  icon={TimerOutlinedIcon}
                  label="Ride time"
                  value={`${formatDuration(rideMinutes)} · ETA ${etaClock(rideMinutes)}`}
                  tone="secondary"
                />
                <FactRow
                  icon={PaymentsRoundedIcon}
                  label={delivery.paymentMode === 'cod' ? 'Collect on delivery' : 'Order value (prepaid)'}
                  value={formatCurrency(delivery.orderValue)}
                  tone={delivery.paymentMode === 'cod' ? 'warning' : 'primary'}
                />
                <FactRow
                  icon={CheckCircleRoundedIcon}
                  label="Your payout"
                  value={formatCurrency(delivery.payout)}
                  tone="success"
                />
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.50', color: 'primary.main', fontWeight: 800 }}>
                  {delivery.customer.name.charAt(0)}
                </Avatar>
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                  <Typography variant="subtitle2" noWrap sx={{ fontWeight: 800 }}>
                    {delivery.customer.name}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <StarRoundedIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {delivery.customer.rating} customer rating
                    </Typography>
                  </Stack>
                </Box>
                <Tooltip title={`Call ${delivery.customer.phone}`}>
                  <IconButton
                    component="a"
                    href={telHref(delivery.customer.phone)}
                    sx={{ bgcolor: 'success.50', color: 'success.main' }}
                  >
                    <PhoneRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </CardContent>
          </Card>

          {delivery.notes && (
            <Alert
              severity="info"
              icon={<NotesRoundedIcon fontSize="small" />}
              sx={{ borderRadius: 4, alignItems: 'flex-start' }}
            >
              <Typography variant="caption" sx={{ fontWeight: 800, display: 'block' }}>
                Delivery note
              </Typography>
              {delivery.notes}
            </Alert>
          )}
        </Stack>
      </Box>

      {/* Stops */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: { xs: 2, md: 2.5 },
          mb: { xs: 2, md: 2.5 },
        }}
      >
        <PlaceCard
          kind="pickup"
          title={delivery.pickup.name}
          address={delivery.pickup.address}
          phone={delivery.pickup.phone}
          position={delivery.pickup.position}
          driver={driver}
          dimmed={hasParcel}
        />
        <PlaceCard
          kind="drop"
          title={delivery.customer.name}
          address={delivery.drop.address}
          landmark={delivery.drop.landmark}
          phone={delivery.customer.phone}
          position={delivery.drop.position}
          driver={driver}
        />
      </Box>

      {/* Items */}
      <Card sx={{ borderRadius: 4 }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, pb: 0 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
            sx={{ flexWrap: 'wrap' }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Order items
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Next stop: {stop.kind === 'pickup' ? delivery.pickup.name : delivery.customer.name}
            </Typography>
          </Stack>
        </CardContent>
        <List sx={{ px: { xs: 0.5, sm: 1.5 } }}>
          {delivery.items.map((item, index) => (
            <ListItem key={`${item.name}-${index}`} divider={index < delivery.items.length - 1}>
              <ListItemText
                primary={item.name}
                secondary={item.weight}
                primaryTypographyProps={{ fontWeight: 700, variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
              <Chip size="small" label={`× ${item.qty}`} sx={{ fontWeight: 800 }} />
            </ListItem>
          ))}
        </List>
      </Card>

      {/* Sticky action bar keeps the primary control in thumb reach on phones. */}
      {nextStatus && (
        <Box
          sx={{
            position: 'sticky',
            bottom: { xs: 'calc(8px + env(safe-area-inset-bottom))', md: 8 },
            mt: 2.5,
            p: 1.25,
            borderRadius: 4,
            display: 'flex',
            gap: 1,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme) => theme.customShadows?.md,
            zIndex: 5,
          }}
        >
          {delivery.status === DELIVERY_STATUS.NEW && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<CloseRoundedIcon />}
              onClick={handleDecline}
              sx={{ flexShrink: 0 }}
            >
              Decline
            </Button>
          )}
          <Button
            fullWidth
            size="large"
            variant="contained"
            startIcon={<CheckCircleRoundedIcon />}
            onClick={handlePrimary}
          >
            {ACTION_LABELS[delivery.status]}
          </Button>
        </Box>
      )}
    </Box>
  );
}
