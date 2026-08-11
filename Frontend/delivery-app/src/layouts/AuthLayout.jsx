import React from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Paper, Typography, Stack, IconButton, Tooltip } from '@mui/material';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import Brand from '../components/layout/Brand';
import { toggleThemeMode } from '../redux/features/uiSlice';

const highlights = [
  { icon: BoltRoundedIcon, title: 'Instant job alerts', body: 'Accept nearby orders the moment they drop.' },
  { icon: MapRoundedIcon, title: 'Live turn-by-turn', body: 'Optimised pickup-to-drop routes on one map.' },
  { icon: PaymentsRoundedIcon, title: 'Daily payouts', body: 'Track every rupee you earn, settled weekly.' },
];

const AuthLayout = () => {
  const dispatch = useDispatch();
  const themeMode = useSelector((state) => state.ui.themeMode);
  const isDark = themeMode === 'dark';

  return (
    <Box
      sx={{
        minHeight: '100svh',
        display: 'grid',
        // Marketing panel appears only when there's room for it.
        gridTemplateColumns: { xs: '1fr', lg: '1.05fr 1fr' },
        bgcolor: 'background.default',
      }}
    >
      {/* Brand / value panel */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: { lg: 6, xl: 8 },
          position: 'relative',
          overflow: 'hidden',
          color: '#fff',
          background: 'linear-gradient(150deg, #F04A08 0%, #FF7A40 46%, #FDB022 100%)',
        }}
      >
        {/* Decorative glow blobs */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            width: 420,
            height: 420,
            borderRadius: '50%',
            top: -120,
            right: -110,
            background: 'radial-gradient(circle, rgba(255,255,255,0.28) 0%, transparent 68%)',
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            width: 340,
            height: 340,
            borderRadius: '50%',
            bottom: -90,
            left: -70,
            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
          }}
        />

        <Box sx={{ position: 'relative' }}>
          <Brand onDark size={46} />
        </Box>

        <Box sx={{ position: 'relative', maxWidth: 460 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, fontSize: 'clamp(2rem, 1.4rem + 1.6vw, 2.75rem)' }}>
            Every order, one clean route.
          </Typography>
          <Typography sx={{ opacity: 0.92, mb: 5, fontSize: '1.05rem' }}>
            The partner app for LocalMart riders — pick up, navigate and deliver without leaving a single screen.
          </Typography>

          <Stack spacing={2.5}>
            {highlights.map(({ icon: Icon, title, body }) => (
              <Box key={title} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    flexShrink: 0,
                    borderRadius: 2.5,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: 'rgba(255,255,255,0.18)',
                    border: '1px solid rgba(255,255,255,0.28)',
                  }}
                >
                  <Icon />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.88 }}>
                    {body}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>

        <Typography variant="caption" sx={{ position: 'relative', opacity: 0.8 }}>
          © {new Date().getFullYear()} LocalMart · Delivery Partner
        </Typography>
      </Box>

      {/* Form panel */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, sm: 4 },
          py: { xs: 4, sm: 6 },
          position: 'relative',
        }}
      >
        <Tooltip title={isDark ? 'Light mode' : 'Dark mode'}>
          <IconButton
            onClick={() => dispatch(toggleThemeMode())}
            sx={{ position: 'absolute', top: 16, right: 16 }}
            aria-label="Toggle colour mode"
          >
            {isDark ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
          </IconButton>
        </Tooltip>

        <Box sx={{ width: '100%', maxWidth: 440 }}>
          <Box sx={{ display: { xs: 'flex', lg: 'none' }, justifyContent: 'center', mb: 4 }}>
            <Brand size={44} />
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 4 },
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: (theme) => theme.customShadows.md,
            }}
          >
            <Outlet />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default AuthLayout;
