import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  TextField,
  Button,
  Avatar,
  Divider,
  IconButton,
  Chip,
  LinearProgress,
  Tooltip,
  Alert,
} from '@mui/material';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import TwoWheelerRoundedIcon from '@mui/icons-material/TwoWheelerRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import PageHeader from '../../components/PageHeader';
import { showToast } from '../../redux/features/uiSlice';
import { formatCurrency } from '../../utils/format';

const DOCUMENTS = [
  { label: 'Driving licence', status: 'Verified', expiry: 'Valid till Mar 2029' },
  { label: 'Vehicle RC', status: 'Verified', expiry: 'Valid till Jan 2028' },
  { label: 'Insurance', status: 'Expiring', expiry: 'Renew by 30 Sep 2026' },
  { label: 'PAN card', status: 'Verified', expiry: 'On file' },
];

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'D';

/** Two-column responsive field grid — CSS Grid, not MUI Grid. */
const FieldGrid = ({ columns = { xs: '1fr', sm: '1fr 1fr' }, children }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: columns, gap: 2 }}>{children}</Box>
);

export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { stats } = useSelector((state) => state.dashboard);

  const [form, setForm] = useState({
    name: user?.name || 'Demo Driver',
    email: user?.email || 'driver@localmart.in',
    phone: user?.phone || '+91 98450 00000',
    emergencyContact: '+91 90080 11223',
    address: '12, 5th Cross, Indiranagar, Bengaluru 560038',
    vehicleType: 'Motorcycle',
    vehicleNumber: 'KA 03 MJ 4821',
    licenseNumber: 'KA0320190004821',
    serviceArea: 'Bengaluru South',
  });
  const [dirty, setDirty] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    setDirty(true);
  };

  const handleSave = () => {
    // Profile PATCH endpoint isn't wired yet — keep the optimistic UX and flag it.
    setDirty(false);
    dispatch(showToast({ message: 'Profile saved on this device', severity: 'success' }));
  };

  const completion = useMemo(() => {
    const values = Object.values(form);
    const filled = values.filter((value) => String(value).trim().length > 0).length;
    return Math.round((filled / values.length) * 100);
  }, [form]);

  return (
    <Box>
      <PageHeader
        icon={PersonRoundedIcon}
        title="My profile"
        subtitle="Keep your contact details and vehicle papers current to stay eligible for jobs."
        actions={
          <Button
            variant="contained"
            startIcon={<SaveRoundedIcon />}
            onClick={handleSave}
            disabled={!dirty}
          >
            Save changes
          </Button>
        }
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '320px 1fr' },
          gap: { xs: 2, md: 2.5 },
          alignItems: 'start',
        }}
      >
        {/* Identity card */}
        <Stack spacing={{ xs: 2, md: 2.5 }}>
          <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
            <Box
              sx={{
                height: 96,
                background: 'linear-gradient(120deg, #C43A05 0%, #F04A08 50%, #FF9E73 100%)',
              }}
            />
            <CardContent sx={{ pt: 0, textAlign: 'center', px: { xs: 2, sm: 2.5 } }}>
              <Box sx={{ position: 'relative', display: 'inline-block', mt: -6, mb: 1 }}>
                <Avatar
                  sx={{
                    width: 96,
                    height: 96,
                    fontSize: 34,
                    fontWeight: 800,
                    bgcolor: 'primary.main',
                    border: '4px solid',
                    borderColor: 'background.paper',
                  }}
                >
                  {initials(form.name)}
                </Avatar>
                <Tooltip title="Change photo">
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      right: -4,
                      bottom: 4,
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': { bgcolor: 'background.subtle' },
                    }}
                  >
                    <PhotoCameraRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {form.name}
              </Typography>
              <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center" sx={{ mb: 1.5 }}>
                <VerifiedRoundedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Delivery partner · {form.serviceArea}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} justifyContent="center" sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Chip
                  size="small"
                  icon={<StarRoundedIcon />}
                  label={stats ? `${stats.averageRating} rating` : 'Rating —'}
                  sx={{ fontWeight: 700, bgcolor: 'warning.50', color: 'warning.dark' }}
                />
                <Chip
                  size="small"
                  icon={<TwoWheelerRoundedIcon />}
                  label={form.vehicleNumber}
                  sx={{ fontWeight: 700 }}
                />
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ textAlign: 'left' }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    Profile completeness
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'success.main' }}>
                    {completion}%
                  </Typography>
                </Stack>
                <LinearProgress variant="determinate" value={completion} color="success" sx={{ bgcolor: 'success.50' }} />
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 1,
                  mt: 2.5,
                  textAlign: 'center',
                }}
              >
                {[
                  { label: 'Jobs', value: stats ? stats.todaysDeliveries : '—' },
                  { label: 'On time', value: stats ? `${stats.onTimeRate}%` : '—' },
                  { label: 'Earned', value: stats ? formatCurrency(stats.monthlyEarnings) : '—' },
                ].map((item) => (
                  <Box key={item.label} sx={{ p: 1, borderRadius: 2.5, bgcolor: 'background.subtle' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.82rem' }}>
                      {item.value}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <DescriptionRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Documents
                </Typography>
              </Stack>
              <Stack divider={<Divider />}>
                {DOCUMENTS.map((doc) => (
                  <Stack key={doc.label} direction="row" spacing={1} alignItems="center" sx={{ py: 1.25 }}>
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {doc.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {doc.expiry}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      icon={doc.status === 'Verified' ? <CheckCircleRoundedIcon /> : undefined}
                      label={doc.status}
                      sx={{
                        fontWeight: 700,
                        bgcolor: doc.status === 'Verified' ? 'success.50' : 'warning.50',
                        color: doc.status === 'Verified' ? 'success.dark' : 'warning.dark',
                      }}
                    />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        {/* Editable details */}
        <Stack spacing={{ xs: 2, md: 2.5 }} sx={{ minWidth: 0 }}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Personal information
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Your phone number is how customers and support reach you.
              </Typography>
              <Divider sx={{ my: 2.5 }} />

              <FieldGrid>
                <TextField fullWidth label="Full name" name="name" value={form.name} onChange={handleChange} />
                <TextField
                  fullWidth
                  label="Email address"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  helperText="Contact support to change your email"
                  disabled
                />
                <TextField fullWidth label="Phone number" name="phone" value={form.phone} onChange={handleChange} />
                <TextField
                  fullWidth
                  label="Emergency contact"
                  name="emergencyContact"
                  value={form.emergencyContact}
                  onChange={handleChange}
                />
              </FieldGrid>

              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Home address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Vehicle &amp; licence
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                These details appear on the customer's tracking screen.
              </Typography>
              <Divider sx={{ my: 2.5 }} />

              <FieldGrid columns={{ xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' }}>
                <TextField
                  fullWidth
                  label="Vehicle type"
                  name="vehicleType"
                  value={form.vehicleType}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  label="Vehicle number"
                  name="vehicleNumber"
                  value={form.vehicleNumber}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  label="Driving licence"
                  name="licenseNumber"
                  value={form.licenseNumber}
                  onChange={handleChange}
                />
              </FieldGrid>

              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Preferred service area"
                  name="serviceArea"
                  value={form.serviceArea}
                  onChange={handleChange}
                  helperText="Jobs are offered from this zone first"
                />
              </Box>
            </CardContent>
          </Card>

          <Alert severity="info" sx={{ borderRadius: 4 }}>
            Profile edits are held on this device for now — the partner profile API isn't connected yet.
          </Alert>

          {/* Mobile-friendly duplicate of the header action. */}
          <Button
            fullWidth
            size="large"
            variant="contained"
            startIcon={<SaveRoundedIcon />}
            onClick={handleSave}
            disabled={!dirty}
            sx={{ display: { xs: 'flex', sm: 'none' } }}
          >
            Save changes
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
