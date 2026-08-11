import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Switch,
  Divider,
  Button,
  TextField,
  MenuItem,
  Slider,
  Chip,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import PageHeader from '../../components/PageHeader';
import { setThemeMode, setDuty, showToast } from '../../redux/features/uiSlice';
import { logout } from '../../redux/features/authSlice';
import { OSRM_BASE, NOMINATIM_BASE } from '../../utils/geo';

/** Label + description + control row, stacked on phones. */
const SettingRow = ({ title, description, control, last }) => (
  <>
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 1.5,
        py: 1.75,
      }}
    >
      <Box sx={{ minWidth: 0, pr: { sm: 2 } }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
            {description}
          </Typography>
        )}
      </Box>
      <Box sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}>{control}</Box>
    </Box>
    {!last && <Divider />}
  </>
);

const SectionCard = ({ icon: Icon, title, subtitle, children }) => (
  <Card sx={{ borderRadius: 4 }}>
    <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'primary.50',
            color: 'primary.main',
          }}
        >
          <Icon sx={{ fontSize: 18 }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
      <Divider sx={{ mt: 1.5 }} />
      {children}
    </CardContent>
  </Card>
);

export default function Settings() {
  const dispatch = useDispatch();
  const themeMode = useSelector((state) => state.ui.themeMode);
  const isOnDuty = useSelector((state) => state.ui.isOnDuty);

  const [prefs, setPrefs] = useState({
    pushJobs: true,
    pushPayouts: true,
    sms: false,
    sound: true,
    autoAccept: false,
    followRoute: true,
    language: 'en-IN',
    maxDistance: 8,
  });

  const toggle = (key) => () => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    dispatch(showToast({ message: 'Preferences saved on this device', severity: 'success' }));
  };

  return (
    <Box>
      <PageHeader
        icon={SettingsRoundedIcon}
        title="Settings"
        subtitle="Control how jobs reach you and how the app looks."
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: { xs: 2, md: 2.5 },
          alignItems: 'start',
        }}
      >
        <Stack spacing={{ xs: 2, md: 2.5 }} sx={{ minWidth: 0 }}>
          <SectionCard
            icon={themeMode === 'dark' ? DarkModeRoundedIcon : LightModeRoundedIcon}
            title="Appearance"
            subtitle="Applies instantly and is remembered on this device."
          >
            <SettingRow
              title="Theme"
              description="Dark mode also switches the map to a night basemap."
              control={
                <ToggleButtonGroup
                  exclusive
                  fullWidth
                  size="small"
                  value={themeMode}
                  onChange={(_, value) => value && dispatch(setThemeMode(value))}
                >
                  <ToggleButton value="light" sx={{ px: 2, gap: 0.75 }}>
                    <LightModeRoundedIcon sx={{ fontSize: 17 }} /> Light
                  </ToggleButton>
                  <ToggleButton value="dark" sx={{ px: 2, gap: 0.75 }}>
                    <DarkModeRoundedIcon sx={{ fontSize: 17 }} /> Dark
                  </ToggleButton>
                </ToggleButtonGroup>
              }
            />
            <SettingRow
              title="Language"
              description="More languages are on the way."
              last
              control={
                <TextField
                  select
                  size="small"
                  fullWidth
                  value={prefs.language}
                  onChange={(event) => setPrefs((prev) => ({ ...prev, language: event.target.value }))}
                  sx={{ minWidth: { sm: 170 } }}
                >
                  <MenuItem value="en-IN">English (India)</MenuItem>
                  <MenuItem value="hi-IN">हिन्दी</MenuItem>
                  <MenuItem value="kn-IN">ಕನ್ನಡ</MenuItem>
                </TextField>
              }
            />
          </SectionCard>

          <SectionCard
            icon={NotificationsActiveRoundedIcon}
            title="Notifications"
            subtitle="Job alerts are the only ones that also ring."
          >
            <SettingRow
              title="New job alerts"
              description="Push notification the moment a job is offered."
              control={<Switch checked={prefs.pushJobs} onChange={toggle('pushJobs')} />}
            />
            <SettingRow
              title="Payout updates"
              description="When a weekly settlement is transferred."
              control={<Switch checked={prefs.pushPayouts} onChange={toggle('pushPayouts')} />}
            />
            <SettingRow
              title="SMS backup"
              description="Text message if a push alert goes unread for 60 seconds."
              control={<Switch checked={prefs.sms} onChange={toggle('sms')} />}
            />
            <SettingRow
              title="Alert sound"
              description="Play a chime with new job alerts."
              last
              control={<Switch checked={prefs.sound} onChange={toggle('sound')} />}
            />
          </SectionCard>
        </Stack>

        <Stack spacing={{ xs: 2, md: 2.5 }} sx={{ minWidth: 0 }}>
          <SectionCard icon={MapRoundedIcon} title="Jobs & navigation" subtitle="How work is offered and routed to you.">
            <SettingRow
              title="Duty status"
              description="Turn this off to stop receiving new jobs."
              control={
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    size="small"
                    label={isOnDuty ? 'Online' : 'Offline'}
                    sx={{
                      fontWeight: 700,
                      bgcolor: isOnDuty ? 'success.50' : 'background.subtle',
                      color: isOnDuty ? 'success.dark' : 'text.secondary',
                    }}
                  />
                  <Switch checked={isOnDuty} onChange={(event) => dispatch(setDuty(event.target.checked))} />
                </Stack>
              }
            />
            <SettingRow
              title="Auto-accept nearby jobs"
              description="Accept jobs within 2 km without confirming."
              control={<Switch checked={prefs.autoAccept} onChange={toggle('autoAccept')} />}
            />
            <SettingRow
              title="Keep map centred on me"
              description="The Live Map starts in follow mode."
              control={<Switch checked={prefs.followRoute} onChange={toggle('followRoute')} />}
            />
            <SettingRow
              title="Maximum trip distance"
              description={`Jobs longer than ${prefs.maxDistance} km won't be offered.`}
              last
              control={
                <Box sx={{ width: { xs: '100%', sm: 190 }, px: 1 }}>
                  <Slider
                    size="small"
                    min={2}
                    max={20}
                    step={1}
                    valueLabelDisplay="auto"
                    value={prefs.maxDistance}
                    onChange={(_, value) => setPrefs((prev) => ({ ...prev, maxDistance: value }))}
                    marks={[
                      { value: 2, label: '2' },
                      { value: 20, label: '20' },
                    ]}
                  />
                </Box>
              }
            />
          </SectionCard>

          <Card sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Map services
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Maps run on OpenStreetMap — no API key or billing account is needed.
              </Typography>
              <Alert severity="info" sx={{ mt: 1.75, borderRadius: 3 }}>
                <Typography variant="caption" sx={{ display: 'block' }}>
                  Tiles: tile.openstreetmap.org
                </Typography>
                <Typography variant="caption" sx={{ display: 'block' }}>
                  Routing: {OSRM_BASE.replace(/^https?:\/\//, '')}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block' }}>
                  Search: {NOMINATIM_BASE.replace(/^https?:\/\//, '')}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.75 }}>
                  These are shared community servers. Point <code>VITE_OSRM_URL</code> and{' '}
                  <code>VITE_NOMINATIM_URL</code> at your own instances before production traffic.
                </Typography>
              </Alert>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 4, borderColor: 'error.200' }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'error.main' }}>
                Account
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Signing out keeps your saved preferences on this device.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<LogoutRoundedIcon />}
                  onClick={() => dispatch(logout())}
                >
                  Sign out
                </Button>
                <Button fullWidth variant="outlined" color="error" startIcon={<DeleteForeverRoundedIcon />} disabled>
                  Request account deletion
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Button fullWidth size="large" variant="contained" onClick={handleSave}>
            Save preferences
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
