import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
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

const TYPE_META = {
  job: { icon: TwoWheelerRoundedIcon, tone: 'primary', label: 'Job' },
  payout: { icon: PaymentsRoundedIcon, tone: 'success', label: 'Payout' },
  completed: { icon: CheckCircleRoundedIcon, tone: 'secondary', label: 'Completed' },
  alert: { icon: WarningAmberRoundedIcon, tone: 'warning', label: 'Alert' },
  news: { icon: CampaignRoundedIcon, tone: 'info', label: 'Update' },
};

const SEED = [
  {
    id: 1,
    type: 'job',
    title: 'New job near Indiranagar',
    message: 'DEL-2041 · Shree Grocery Mart → Koramangala · ₹68 payout, 3.4 km.',
    date: '2026-08-11T14:22:00',
    read: false,
    link: '/deliveries/DEL-2041',
  },
  {
    id: 2,
    type: 'alert',
    title: 'Insurance expires soon',
    message: 'Upload your renewed two-wheeler insurance before 30 Sep 2026 to stay eligible.',
    date: '2026-08-11T12:05:00',
    read: false,
    link: '/profile',
  },
  {
    id: 3,
    type: 'payout',
    title: 'Weekly settlement credited',
    message: '₹7,420 was transferred to HDFC ••4412 for the week ending 9 Aug.',
    date: '2026-08-10T09:12:00',
    read: false,
    link: '/earnings',
  },
  {
    id: 4,
    type: 'completed',
    title: 'DEL-2030 delivered',
    message: 'Kavya Suresh rated you 5 stars. ₹66 added to today’s earnings.',
    date: '2026-08-11T13:35:00',
    read: true,
    link: '/history',
  },
  {
    id: 5,
    type: 'news',
    title: 'Surge active in HSR Layout',
    message: 'Evening peak bonus of ₹15 per trip is live until 9 pm.',
    date: '2026-08-11T11:00:00',
    read: true,
    link: '/map',
  },
];

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
];

export default function Notifications() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [items, setItems] = useState(SEED);
  const [tab, setTab] = useState(0);

  const unread = items.filter((item) => !item.read).length;

  // Publish the count so the topbar, sidebar and bottom nav badges agree.
  useEffect(() => {
    dispatch(setUnreadCount(unread));
  }, [dispatch, unread]);

  const visible = useMemo(
    () => (TABS[tab].key === 'unread' ? items.filter((item) => !item.read) : items),
    [items, tab],
  );

  const markAllRead = () => {
    setItems((list) => list.map((item) => ({ ...item, read: true })));
    dispatch(showToast({ message: 'All notifications marked as read', severity: 'success' }));
  };

  const openItem = (item) => {
    setItems((list) => list.map((entry) => (entry.id === item.id ? { ...entry, read: true } : entry)));
    if (item.link) navigate(item.link);
  };

  const remove = (event, id) => {
    event.stopPropagation();
    setItems((list) => list.filter((item) => item.id !== id));
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
                  key={item.id}
                  direction="row"
                  spacing={1.75}
                  alignItems="flex-start"
                  onClick={() => openItem(item)}
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    cursor: 'pointer',
                    bgcolor: item.read ? 'transparent' : 'background.subtle',
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
                      <Typography variant="subtitle2" sx={{ fontWeight: item.read ? 700 : 800 }}>
                        {item.title}
                      </Typography>
                      {!item.read && (
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
                      {formatRelative(item.date)}
                    </Typography>
                  </Box>

                  <Tooltip title="Dismiss">
                    <IconButton
                      size="small"
                      aria-label="Dismiss notification"
                      onClick={(event) => remove(event, item.id)}
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
