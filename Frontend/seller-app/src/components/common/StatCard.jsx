import React from 'react';
import { Card, CardContent, Box, Typography, Avatar, alpha, useTheme } from '@mui/material';

/**
 * Dashboard metric tile. Renders two-up at 360px, so the value and icon scale
 * down at `xs` to keep long amounts (₹1,24,500) from clipping.
 */
const StatCard = ({ title, value, icon, gradient, caption }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform .3s ease, box-shadow .3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.softShadow.lg,
        },
      }}
    >
      {/* Decorative corner wash tinted to the tile's gradient. */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          right: -34,
          top: -34,
          width: 130,
          height: 130,
          borderRadius: '50%',
          background: gradient,
          opacity: 0.14,
          transition: 'transform .3s ease',
          '.MuiCard-root:hover &': { transform: 'scale(1.18)' },
        }}
      />

      <CardContent
        sx={{
          position: 'relative',
          zIndex: 1,
          p: { xs: 2, sm: 2.5, md: 3 },
          '&:last-child': { pb: { xs: 2, sm: 2.5, md: 3 } },
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 1,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ display: 'block', fontSize: { xs: '0.625rem', sm: '0.7rem' }, lineHeight: 1.6 }}
            >
              {title}
            </Typography>
            <Typography
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                fontSize: { xs: '1.35rem', sm: '1.6rem', md: '1.875rem' },
                wordBreak: 'break-word',
              }}
            >
              {value}
            </Typography>
          </Box>

          <Avatar
            variant="rounded"
            sx={{
              background: gradient,
              color: '#fff',
              flexShrink: 0,
              width: { xs: 38, sm: 46, md: 52 },
              height: { xs: 38, sm: 46, md: 52 },
              borderRadius: 3,
              boxShadow: `0 6px 16px ${alpha(theme.palette.common.black, 0.16)}`,
              '& svg': { fontSize: { xs: 20, sm: 24 } },
            }}
          >
            {icon}
          </Avatar>
        </Box>

        {caption && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 'auto', fontWeight: 600, fontSize: { xs: '0.68rem', sm: '0.75rem' } }}
          >
            {caption}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
