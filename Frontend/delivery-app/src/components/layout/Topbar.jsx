import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Tooltip,
  Switch,
  Chip,
  Badge,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
import { layout } from '../../theme';
import { findNavItem } from './navConfig';
import {
  setMobileNavOpen,
  toggleThemeMode,
  toggleDuty,
  showToast,
} from '../../redux/features/uiSlice';

const initialsOf = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'D';

export default function Topbar({ onLogout }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState(null);
  const { themeMode, isOnDuty, unreadCount } = useSelector((state) => state.ui);
  const user = useSelector((state) => state.auth.user);

  const current = findNavItem(location.pathname);
  const isDark = themeMode === 'dark';

  const handleDuty = () => {
    dispatch(toggleDuty());
    dispatch(
      showToast({
        message: isOnDuty ? 'You are now offline — no new jobs' : "You're online and receiving jobs",
        severity: isOnDuty ? 'info' : 'success',
      }),
    );
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        top: 0,
        bgcolor: isDark ? 'rgba(19, 28, 46, 0.82)' : 'rgba(255, 255, 255, 0.86)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
        zIndex: (t) => t.zIndex.drawer - 1,
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 60, md: layout.topbarHeight },
          px: { xs: 1.5, sm: 2.5, lg: 3 },
          gap: { xs: 0.5, sm: 1 },
        }}
      >
        {isMobile && (
          <IconButton edge="start" onClick={() => dispatch(setMobileNavOpen(true))} aria-label="Open menu">
            <MenuRoundedIcon />
          </IconButton>
        )}

        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>
            {current?.label || 'LocalMart Delivery'}
          </Typography>
          {!isMobile && (
            <Typography variant="caption" noWrap sx={{ color: 'text.secondary' }}>
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </Typography>
          )}
        </Box>

        {/* Duty toggle. On phones the label collapses to a coloured dot chip. */}
        <Tooltip title={isOnDuty ? 'Go offline' : 'Go online'}>
          <Box
            onClick={handleDuty}
            role="switch"
            aria-checked={isOnDuty}
            aria-label="Duty status"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              pl: { xs: 0.75, sm: 1.25 },
              pr: { xs: 0.25, sm: 0.5 },
              py: 0.25,
              cursor: 'pointer',
              borderRadius: 999,
              border: '1px solid',
              borderColor: isOnDuty ? 'success.200' : 'divider',
              bgcolor: isOnDuty ? 'success.50' : 'background.subtle',
              transition: 'all .2s ease',
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                flexShrink: 0,
                bgcolor: isOnDuty ? 'success.main' : 'grey.400',
                boxShadow: isOnDuty ? (t) => `0 0 0 3px ${t.palette.success[100]}` : 'none',
              }}
            />
            <Typography
              variant="caption"
              sx={{
                display: { xs: 'none', sm: 'block' },
                fontWeight: 700,
                color: isOnDuty ? 'success.dark' : 'text.secondary',
              }}
            >
              {isOnDuty ? 'Online' : 'Offline'}
            </Typography>
            <Switch checked={isOnDuty} size="small" color="success" sx={{ pointerEvents: 'none' }} />
          </Box>
        </Tooltip>

        <Tooltip title="Live map">
          <IconButton onClick={() => navigate('/map')} aria-label="Live map">
            <MyLocationRoundedIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title={isDark ? 'Light mode' : 'Dark mode'}>
          <IconButton onClick={() => dispatch(toggleThemeMode())} aria-label="Toggle colour mode">
            {isDark ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Notifications">
          <IconButton onClick={() => navigate('/notifications')} aria-label="Notifications">
            <Badge badgeContent={unreadCount} color="error" max={9}>
              <NotificationsRoundedIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <Tooltip title="Account">
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: { xs: 0, sm: 0.5 }, p: 0.5 }}>
            <Avatar
              src={user?.avatar || undefined}
              sx={{
                width: 36,
                height: 36,
                fontSize: '0.875rem',
                bgcolor: 'primary.main',
              }}
            >
              {initialsOf(user?.name)}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          slotProps={{
            paper: {
              sx: { mt: 1, minWidth: 240, borderRadius: 3, border: '1px solid', borderColor: 'divider' },
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
              {user?.name || 'Driver'}
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: 'text.secondary', display: 'block' }}>
              {user?.email || 'driver@localmart.com'}
            </Typography>
            <Chip
              size="small"
              label={isOnDuty ? 'On duty' : 'Off duty'}
              color={isOnDuty ? 'success' : 'default'}
              sx={{ mt: 1 }}
            />
          </Box>
          <Divider />
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              navigate('/profile');
            }}
          >
            <ListItemIcon>
              <PersonRoundedIcon fontSize="small" />
            </ListItemIcon>
            My profile
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              navigate('/settings');
            }}
          >
            <ListItemIcon>
              <SettingsRoundedIcon fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              onLogout?.();
            }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <LogoutRoundedIcon fontSize="small" sx={{ color: 'error.main' }} />
            </ListItemIcon>
            Sign out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
