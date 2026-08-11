import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Tooltip,
  IconButton,
  Divider,
  Badge,
} from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import Brand from './Brand';
import { navSections } from './navConfig';
import { layout } from '../../theme';
import { toggleSidebar } from '../../redux/features/uiSlice';

function NavRow({ item, collapsed, active, badge, onNavigate }) {
  const Icon = item.icon;

  const row = (
    <ListItemButton
      component={NavLink}
      to={item.path}
      onClick={onNavigate}
      sx={{
        px: collapsed ? 1.5 : 1.75,
        py: 1.15,
        mb: 0.5,
        justifyContent: collapsed ? 'center' : 'flex-start',
        color: active ? 'primary.main' : 'text.secondary',
        bgcolor: active ? 'action.selected' : 'transparent',
        fontWeight: active ? 700 : 500,
        '&:hover': { bgcolor: active ? 'action.selected' : 'action.hover', color: 'text.primary' },
        // Left accent rail marks the active route without shifting layout.
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: '22%',
          bottom: '22%',
          width: 3,
          borderRadius: 3,
          bgcolor: 'primary.main',
          opacity: active ? 1 : 0,
          transition: 'opacity .18s ease',
        },
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 0,
          mr: collapsed ? 0 : 1.75,
          color: 'inherit',
          justifyContent: 'center',
        }}
      >
        <Badge
          color="error"
          variant="dot"
          invisible={!badge}
          overlap="circular"
          sx={{ '& .MuiBadge-dot': { boxShadow: '0 0 0 2px currentColor' } }}
        >
          <Icon sx={{ fontSize: 22 }} />
        </Badge>
      </ListItemIcon>

      {!collapsed && (
        <ListItemText
          primary={item.label}
          slotProps={{
            primary: { fontSize: '0.92rem', fontWeight: active ? 700 : 500, noWrap: true },
          }}
        />
      )}
    </ListItemButton>
  );

  return collapsed ? (
    <Tooltip title={item.label} placement="right" arrow>
      {row}
    </Tooltip>
  ) : (
    row
  );
}

/**
 * Persistent desktop navigation. Collapses to an icon rail; on mobile the same
 * component is rendered inside a temporary Drawer with `collapsed` forced off.
 */
export default function Sidebar({ variant = 'desktop', onNavigate }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const collapsedPref = useSelector((state) => state.ui.sidebarCollapsed);
  const unreadCount = useSelector((state) => state.ui.unreadCount) || 0;

  const collapsed = variant === 'desktop' && collapsedPref;

  return (
    <Box
      sx={{
        width: collapsed ? layout.sidebarCollapsedWidth : layout.sidebarWidth,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        transition: (theme) =>
          theme.transitions.create('width', { duration: theme.transitions.duration.shorter }),
      }}
    >
      <Box
        sx={{
          height: layout.topbarHeight,
          px: collapsed ? 1.5 : 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: 1,
          flexShrink: 0,
        }}
      >
        <Brand compact={collapsed} size={collapsed ? 40 : 38} />

        {variant === 'desktop' && !collapsed && (
          <Tooltip title="Collapse menu">
            <IconButton size="small" onClick={() => dispatch(toggleSidebar())}>
              <ChevronLeftRoundedIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {variant === 'desktop' && collapsed && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pb: 1 }}>
          <Tooltip title="Expand menu" placement="right">
            <IconButton size="small" onClick={() => dispatch(toggleSidebar())}>
              <ChevronRightRoundedIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      <Divider sx={{ mx: collapsed ? 1 : 2 }} />

      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', px: collapsed ? 1 : 1.5, py: 1.5 }}>
        {navSections.map((section) => (
          <Box key={section.heading} sx={{ mb: 1.5 }}>
            {!collapsed && (
              <Typography
                variant="overline"
                sx={{ px: 1.75, color: 'text.disabled', fontSize: '0.66rem', display: 'block', mb: 0.5 }}
              >
                {section.heading}
              </Typography>
            )}
            <List disablePadding>
              {section.items.map((item) => (
                <NavRow
                  key={item.path}
                  item={item}
                  collapsed={collapsed}
                  active={
                    location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
                  }
                  badge={item.path === '/notifications' && unreadCount > 0}
                  onNavigate={onNavigate}
                />
              ))}
            </List>
          </Box>
        ))}
      </Box>

      <Divider sx={{ mx: collapsed ? 1 : 2 }} />

      <Box sx={{ p: collapsed ? 1 : 1.5 }}>
        <Tooltip title={collapsed ? 'Sign out' : ''} placement="right" arrow disableHoverListener={!collapsed}>
          <ListItemButton
            onClick={() => onNavigate?.('logout')}
            sx={{
              px: collapsed ? 1.5 : 1.75,
              py: 1.1,
              justifyContent: collapsed ? 'center' : 'flex-start',
              color: 'error.main',
              '&:hover': { bgcolor: 'error.50' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? 0 : 1.75, color: 'inherit', justifyContent: 'center' }}>
              <LogoutRoundedIcon sx={{ fontSize: 22 }} />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText primary="Sign out" slotProps={{ primary: { fontSize: '0.92rem', fontWeight: 600 } }} />
            )}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
