import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';

/** Neutral placeholder for empty lists, filtered-to-nothing tables and errors. */
export default function EmptyState({
  icon: Icon = InboxRoundedIcon,
  title = 'Nothing here yet',
  description,
  actionLabel,
  onAction,
  dense = false,
  sx,
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        px: 3,
        py: dense ? 4 : 7,
        ...sx,
      }}
    >
      <Box
        sx={{
          width: dense ? 56 : 72,
          height: dense ? 56 : 72,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'background.subtle',
          color: 'text.disabled',
          mb: 2,
        }}
      >
        <Icon sx={{ fontSize: dense ? 26 : 34 }} />
      </Box>

      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>

      {description && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 380 }}>
          {description}
        </Typography>
      )}

      {actionLabel && onAction && (
        <Button variant="outlined" onClick={onAction} sx={{ mt: 2.5 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
