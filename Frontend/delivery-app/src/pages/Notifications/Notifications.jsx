import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Avatar,
  IconButton,
  Button,
  Chip,
  Divider,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import TwoWheelerRoundedIcon from '@mui/icons-material/TwoWheelerRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { setUnreadCount, showToast } from '../../redux/features/uiSlice';
import { formatRelative } from '../../utils/format';
import { apiFetch } from '../../utils/api';

const TYPE_META = {
  job: { icon: TwoWheelerRoundedIcon, tone: 'primary', label: 'Job' },
  payout: { icon: PaymentsRoundedIcon, tone: 'success', label: 'Payout' },
  completed: { icon: CheckCircleRoundedIcon, tone: 'secondary', label: 'Completed' },
  alert: { icon: WarningAmberRoundedIcon, tone: 'warning', label: 'Alert' },
  news: { icon: CampaignRoundedIcon, tone: 'info', label: 'Update' },
  ORDER_STATUS_UPDATED: { icon: CampaignRoundedIcon, tone: 'info', label: 'Order Update' },
  DELIVERY_ASSIGNED: { icon: TwoWheelerRoundedIcon, tone: 'primary', label: 'New Job' }
};

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
];

export default function Notifications() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const userId = user?.id || user?._id || user?.userId || user?.deliveryPartnerId;

  const [items, setItems] = useState([]);
  const [tab, setTab] = useState(0);

  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`http://localhost:3000/api/v1/notifications?userId=${userId}`, { credentials: "include" });
      const data = await res.json();
      if (data && data.success) {
        setItems(data.data || []);
      }
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const unread = items.filter((item) => !item.isRead).length;

  useEffect(() => {
    dispatch(setUnreadCount(unread));
  }, [dispatch, unread]);

  const visible = useMemo(
    () => (TABS[tab].key === 'unread' ? items.filter((item) => !item.isRead) : items),
    [items, tab],
  );

  const markAllRead = async () => {
    try {
      await fetch(`http://localhost:3000/api/v1/notifications/read-all?userId=${userId}`, { method: 'PUT', credentials: 'include' });
      setItems((list) => list.map((item) => ({ ...item, isRead: true })));
      dispatch(showToast({ message: 'All notifications marked as read', severity: 'success' }));
    } catch (err) {
      console.error(err);
    }
  };

  const openItem = async (item) => {
    try {
      await fetch(`http://localhost:3000/api/v1/notifications/${item._id}/read?userId=${userId}`, { method: 'PUT', credentials: 'include' });
      setItems((list) => list.map((entry) => (entry._id === item._id ? { ...entry, isRead: true } : entry)));
    } catch (err) {}
    
    if (item.metadata?.orderId) {
      navigate(`/deliveries/${item.metadata.orderId}`);
    } else if (item.link) {
      navigate(item.link);
    }
  };

  const remove = async (event, id) => {
    event.stopPropagation();
    try {
      await fetch(`http://localhost:3000/api/v1/notifications/${id}?userId=${userId}`, { method: 'DELETE', credentials: 'include' });
      setItems((list) => list.filter((item) => item._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box>
      <PageHeader
        icon={NotificationsRoundedIcon}
        title="Notifications"
        subtitle={unread ? `${unread} unread ${unread === 1 ? 'update' : 'updates'}` : 'You’re all caught up.'}
        actions={
          <Button
            variant="outlined"
            startIcon={<DoneAllRoundedIcon />}
            onClick={markAllRead}
            disabled={!unread}
          >
            Mark all read
          </Button>
        }
      />

      <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <Box sx={{ px: { xs: 1, sm: 2 }, pt: 1 }}>
          <Tabs value={tab} onChange={(_, value) => setTab(value)}>
            {TABS.map((entry) => (
              <Tab
                key={entry.key}
                label={entry.key === 'unread' && unread ? `${entry.label} (${unread})` : entry.label}
              />
            ))}
          </Tabs>
        </Box>
        <Divider />

        {!visible.length ? (
          <EmptyState
            icon={NotificationsRoundedIcon}
            title={TABS[tab].key === 'unread' ? 'Nothing unread' : 'No notifications'}
            description="Job offers, payout confirmations and account alerts land here."
          />
        ) : (
          <Stack divider={<Divider />}>
            {visible.map((item) => {
              const meta = TYPE_META[item.type] || TYPE_META.news;
              const Icon = meta.icon;
              return (
                  <Stack
                  key={item._id}
                  direction="row"
                  spacing={1.75}
                  alignItems="flex-start"
                  onClick={() => openItem(item)}
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    cursor: 'pointer',
                    bgcolor: item.isRead ? 'transparent' : 'background.subtle',
                    transition: 'background-color 160ms ease',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      flexShrink: 0,
                      bgcolor: `${meta.tone}.50`,
                      color: `${meta.tone}.main`,
                    }}
                  >
                    <Icon fontSize="small" />
                  </Avatar>

                  <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: item.isRead ? 700 : 800 }}>
                        {item.title}
                      </Typography>
                      {!item.isRead && (
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                      )}
                      <Chip
                        size="small"
                        label={meta.label}
                        sx={{
                          height: 20,
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          bgcolor: `${meta.tone}.50`,
                          color: `${meta.tone}.dark`,
                        }}
                      />
                    </Stack>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.4 }}>
                      {item.message}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.5 }}>
                      {formatRelative(item.createdAt)}
                    </Typography>
                  </Box>

                  <Tooltip title="Dismiss">
                    <IconButton
                      size="small"
                      aria-label="Dismiss notification"
                      onClick={(event) => remove(event, item._id)}
                      sx={{ flexShrink: 0, color: 'text.secondary' }}
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              );
            })}
          </Stack>
        )}
      </Card>

      {items.length > 0 && (
        <CardContent sx={{ px: 0, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Notifications older than 30 days are removed automatically.
          </Typography>
        </CardContent>
      )}
    </Box>
  );
}
