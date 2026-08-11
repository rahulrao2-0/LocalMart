import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Paper, BottomNavigation, BottomNavigationAction, Badge } from '@mui/material';
import { bottomNavItems } from './navConfig';
import { layout } from '../../theme';

/**
 * Thumb-reachable navigation for phones. Hidden from md upwards, where the
 * persistent sidebar takes over.
 */
export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const unreadCount = useSelector((state) => state.ui.unreadCount);

  const activeIndex = bottomNavItems.findIndex(
    (item) => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`),
  );

  return (
    <Paper
      elevation={0}
      sx={{
        display: { xs: 'block', md: 'none' },
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: (t) => t.zIndex.appBar,
        borderTop: '1px solid',
        borderColor: 'divider',
        borderRadius: 0,
        pb: 'env(safe-area-inset-bottom)',
        backdropFilter: 'blur(12px)',
        bgcolor: (t) =>
          t.palette.mode === 'dark' ? 'rgba(19, 28, 46, 0.92)' : 'rgba(255, 255, 255, 0.94)',
      }}
    >
      <BottomNavigation
        value={activeIndex === -1 ? false : activeIndex}
        onChange={(_, index) => navigate(bottomNavItems[index].path)}
        showLabels
        sx={{
          height: layout.bottomNavHeight,
          bgcolor: 'transparent',
          '& .MuiBottomNavigationAction-root': {
            minWidth: 0,
            color: 'text.secondary',
            gap: 0.25,
          },
          '& .MuiBottomNavigationAction-label': { fontSize: '0.68rem', fontWeight: 600 },
          '& .Mui-selected': { color: 'primary.main' },
        }}
      >
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const showBadge = item.path === '/notifications' && unreadCount > 0;
          return (
            <BottomNavigationAction
              key={item.path}
              label={item.short}
              icon={
                showBadge ? (
                  <Badge color="error" variant="dot">
                    <Icon />
                  </Badge>
                ) : (
                  <Icon />
                )
              }
            />
          );
        })}
      </BottomNavigation>
    </Paper>
  );
}
