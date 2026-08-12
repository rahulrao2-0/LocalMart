import React from 'react';
import { Box, Typography, alpha, useTheme } from '@mui/material';

/**
 * Centered empty/zero-result state: tinted icon, title, description, action.
 */
const EmptyState = ({ icon, title, description, action, dense = false }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        px: 3,
        py: dense ? 5 : { xs: 6, sm: 8 },
      }}
    >
      {icon && (
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '20px',
            display: 'grid',
            placeItems: 'center',
            mb: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            color: 'primary.main',
            '& svg': { fontSize: 32 },
          }}
        >
          {icon}
        </Box>
      )}
      <Typography variant="h6" color="text.primary" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 3 }}>{action}</Box>}
    </Box>
  );
};

export default EmptyState;
