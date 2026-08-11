import { createSlice } from '@reduxjs/toolkit';

const THEME_KEY = 'delivery_theme_mode';
const DUTY_KEY = 'delivery_duty_status';
const SIDEBAR_KEY = 'delivery_sidebar_collapsed';

const readStored = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const persist = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private-mode / quota failures shouldn't break the UI.
  }
};

const prefersDark = () => {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
};

const initialState = {
  themeMode: readStored(THEME_KEY, null) ?? (prefersDark() ? 'dark' : 'light'),
  sidebarCollapsed: readStored(SIDEBAR_KEY, false),
  mobileNavOpen: false,
  // Driver duty status — drives the topbar switch and gates job acceptance.
  isOnDuty: readStored(DUTY_KEY, true),
  // Published by the Notifications page so the topbar/sidebar badges stay in sync.
  unreadCount: 0,
  toast: null, // { message, severity }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setThemeMode(state, action) {
      state.themeMode = action.payload === 'dark' ? 'dark' : 'light';
      persist(THEME_KEY, state.themeMode);
    },
    toggleThemeMode(state) {
      state.themeMode = state.themeMode === 'dark' ? 'light' : 'dark';
      persist(THEME_KEY, state.themeMode);
    },
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      persist(SIDEBAR_KEY, state.sidebarCollapsed);
    },
    setMobileNavOpen(state, action) {
      state.mobileNavOpen = Boolean(action.payload);
    },
    setDuty(state, action) {
      state.isOnDuty = Boolean(action.payload);
      persist(DUTY_KEY, state.isOnDuty);
    },
    toggleDuty(state) {
      state.isOnDuty = !state.isOnDuty;
      persist(DUTY_KEY, state.isOnDuty);
    },
    setUnreadCount(state, action) {
      state.unreadCount = Math.max(0, Number(action.payload) || 0);
    },
    showToast(state, action) {
      const payload = action.payload;
      state.toast =
        typeof payload === 'string'
          ? { message: payload, severity: 'success' }
          : { severity: 'success', ...payload };
    },
    clearToast(state) {
      state.toast = null;
    },
  },
});

export const {
  setThemeMode,
  toggleThemeMode,
  toggleSidebar,
  setMobileNavOpen,
  setDuty,
  toggleDuty,
  setUnreadCount,
  showToast,
  clearToast,
} = uiSlice.actions;

export default uiSlice.reducer;
