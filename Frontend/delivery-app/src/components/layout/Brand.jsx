import React from 'react';
import { Box, Typography } from '@mui/material';
import TwoWheelerRoundedIcon from '@mui/icons-material/TwoWheelerRounded';

/**
 * LocalMart delivery wordmark. `compact` renders the badge only, for the
 * collapsed icon rail.
 */
export default function Brand({ compact = false, size = 40, onDark = false }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
      <Box
        component="img"
        src="/favicon.svg"
        alt="LocalMart Delivery"
        sx={{
          width: size,
          height: size,
          flexShrink: 0,
        }}
      />

      {!compact && (
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            noWrap
            sx={{ fontWeight: 800, lineHeight: 1.15, color: onDark ? '#fff' : 'text.primary' }}
          >
            LocalMart
          </Typography>
          <Typography
            variant="caption"
            noWrap
            sx={{
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: onDark ? 'rgba(255,255,255,0.75)' : 'primary.main',
            }}
          >
            Delivery
          </Typography>
        </Box>
      )}
    </Box>
  );
}
