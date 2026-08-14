import React from 'react';
import { Chip } from '@mui/material';
import { STATUS_META } from '../utils/deliveryConstants';

/**
 * Soft-filled status pill driven by STATUS_META, so a new delivery status only
 * needs adding in one place.
 */
export default function StatusChip({ status, size = 'small', sx, ...rest }) {
  const meta = STATUS_META[status] || { label: status || 'Unknown', color: 'default' };
  const isDefault = meta.color === 'default';

  return (
    <Chip
      size={size}
      label={meta.label}
      sx={{
        fontWeight: 700,
        color: isDefault ? 'text.secondary' : `${meta.color}.dark`,
        bgcolor: isDefault ? 'background.subtle' : `${meta.color}.50`,
        border: '1px solid',
        borderColor: isDefault ? 'divider' : `${meta.color}.200`,
        ...sx,
      }}
      {...rest}
    />
  );
}
