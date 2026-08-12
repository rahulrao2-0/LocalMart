import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Page title + subtitle with a wrapping action slot.
 * Actions drop below the heading and stretch full-width on phones.
 */
const PageHeader = ({ title, subtitle, actions }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      justifyContent: 'space-between',
      alignItems: { xs: 'stretch', md: 'center' },
      gap: 2,
      mb: { xs: 3, md: 4 },
    }}
  >
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="h4" color="text.primary" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>

    {actions && (
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.5,
          flexShrink: 0,
          '& > *': { flex: { xs: '1 1 100%', sm: '0 0 auto' } },
        }}
      >
        {actions}
      </Box>
    )}
  </Box>
);

export default PageHeader;
