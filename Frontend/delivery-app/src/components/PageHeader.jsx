import React from 'react';
import { Box, Typography, Stack } from '@mui/material';

/**
 * Page title block with optional description and right-aligned actions.
 * Actions wrap below the title on narrow screens.
 */
export default function PageHeader({ title, subtitle, actions, icon: Icon, sx }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        mb: { xs: 2.5, md: 3 },
        ...sx,
      }}
    >
      <Stack direction="row" spacing={1.75} alignItems="center" sx={{ minWidth: 0 }}>
        {Icon && (
          <Box
            sx={{
              width: 46,
              height: 46,
              flexShrink: 0,
              borderRadius: 3,
              display: { xs: 'none', sm: 'grid' },
              placeItems: 'center',
              color: 'primary.main',
              bgcolor: 'primary.50',
            }}
          >
            <Icon />
          </Box>
        )}
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>

      {actions && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ flexShrink: 0, flexWrap: 'wrap', gap: 1, '& > *': { minWidth: 0 } }}
        >
          {actions}
        </Stack>
      )}
    </Box>
  );
}
