import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import TwoWheelerRoundedIcon from '@mui/icons-material/TwoWheelerRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

// Single source of truth for navigation so the sidebar, mobile drawer and
// bottom bar can never drift apart.
export const navSections = [
  {
    heading: 'Driving',
    items: [
      { label: 'Dashboard', short: 'Home', path: '/dashboard', icon: DashboardRoundedIcon },
      { label: 'Deliveries', short: 'Jobs', path: '/deliveries', icon: TwoWheelerRoundedIcon },
      { label: 'Live Map', short: 'Map', path: '/map', icon: MapRoundedIcon },
    ],
  },
  {
    heading: 'Records',
    items: [
      { label: 'History', short: 'History', path: '/history', icon: HistoryRoundedIcon },
      { label: 'Earnings', short: 'Earnings', path: '/earnings', icon: AccountBalanceWalletRoundedIcon },
      { label: 'Notifications', short: 'Alerts', path: '/notifications', icon: NotificationsRoundedIcon },
    ],
  },
  {
    heading: 'Account',
    items: [
      { label: 'Profile', short: 'Profile', path: '/profile', icon: PersonRoundedIcon },
      { label: 'Settings', short: 'Settings', path: '/settings', icon: SettingsRoundedIcon },
    ],
  },
];

export const navItems = navSections.flatMap((section) => section.items);

// Five slots is the ergonomic ceiling for a thumb-reachable bottom bar.
export const bottomNavPaths = ['/dashboard', '/deliveries', '/map', '/earnings', '/profile'];

export const bottomNavItems = bottomNavPaths
  .map((path) => navItems.find((item) => item.path === path))
  .filter(Boolean);

export const findNavItem = (pathname) =>
  navItems.find((item) => pathname === item.path || pathname.startsWith(`${item.path}/`));
