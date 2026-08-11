import React from 'react';
import { Card, CardContent, Typography, Box, Skeleton, alpha } from '@mui/material';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';

/**
 * Metric tile.
 *
 * @param {string} tone one of the theme palette keys (primary, success, ...).
 *                      Preferred over a raw hex so dark mode stays consistent.
 * @param {'up'|'down'} trend
 */
const StatCard = ({
  title,
  value,
  icon,
  tone = 'primary',
  color,
  subtitle,
  trend,
  trendValue,
  loading = false,
  onClick,
  sx,
}) => {
  const interactive = Boolean(onClick);

  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
        cursor: interactive ? 'pointer' : 'default',
        transition: 'transform .18s ease, box-shadow .18s ease, border-color .18s ease',
        '&:hover': interactive
          ? {
              transform: 'translateY(-3px)',
              boxShadow: (theme) => theme.customShadows.md,
              borderColor: `${tone}.200`,
            }
          : undefined,
        ...sx,
      }}
    >
      {/* Tinted wash keyed to the metric's tone. */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: -34,
          right: -34,
          width: 120,
          height: 120,
          borderRadius: '50%',
          bgcolor: (theme) =>
            color ? alpha(color, 0.1) : alpha(theme.palette[tone]?.main || '#000', 0.08),
        }}
      />

      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, position: 'relative' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 1 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              flexShrink: 0,
              borderRadius: 3,
              display: 'grid',
              placeItems: 'center',
              color: color || `${tone}.main`,
              bgcolor: color ? alpha(color, 0.14) : `${tone}.50`,
            }}
          >
            {icon}
          </Box>

          {trend && !loading && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.25,
                px: 1,
                py: 0.35,
                borderRadius: 2,
                fontSize: '0.72rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                bgcolor: trend === 'up' ? 'success.50' : 'error.50',
                color: trend === 'up' ? 'success.dark' : 'error.dark',
              }}
            >
              {trend === 'up' ? (
                <TrendingUpRoundedIcon sx={{ fontSize: 15 }} />
              ) : (
                <TrendingDownRoundedIcon sx={{ fontSize: 15 }} />
              )}
              {trendValue}
            </Box>
          )}
        </Box>

        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            display: 'block',
            mb: 0.35,
          }}
        >
          {title}
        </Typography>

        {loading ? (
          <Skeleton variant="text" width="60%" sx={{ fontSize: '1.9rem' }} />
        ) : (
          <Typography
            sx={{
              fontWeight: 800,
              lineHeight: 1.15,
              // Long rupee figures shrink instead of wrapping.
              fontSize: 'clamp(1.35rem, 1.1rem + 0.9vw, 1.85rem)',
            }}
          >
            {value}
          </Typography>
        )}

        {subtitle && !loading && (
          <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.75, display: 'block' }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
