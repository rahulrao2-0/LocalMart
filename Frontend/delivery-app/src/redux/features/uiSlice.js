import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../utils/api';

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

export const toggleDutyStatus = createAsyncThunk(
  'ui/toggleDutyStatus',
  async (isOnline, { rejectWithValue, dispatch }) => {
    try {
      // Optimistic update
      dispatch(uiSlice.actions.setDuty(isOnline));

      let lat = null;
      let lng = null;

      // Ask delivery man for location share if going online
      if (isOnline && navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
          });
          lat = position.coords.latitude;
          lng = position.coords.longitude;
        } catch (geoErr) {
          console.warn('Geolocation failed or denied. Proceeding without location.', geoErr);
        }
      }

      const res = await apiFetch('/users/delivery-partners/status', {
        method: 'PUT',
        body: JSON.stringify({ isOnline, lat, lng })
      });
      return res;
    } catch (error) {
      // Revert on failure
      dispatch(uiSlice.actions.setDuty(!isOnline));
      return rejectWithValue(error.message || 'Failed to update duty status');
    }
  }
);

const initialState = {
  themeMode: readStored(THEME_KEY, null) ?? (prefersDark() ? 'dark' : 'light'),
  sidebarCollapsed: readStored(SIDEBAR_KEY, false),
  mobileNavOpen: false,
  // Driver duty status — drives the topbar switch and gates job acceptance.
  isOnDuty: readStored(DUTY_KEY, false), // Default to false so they have to explicitly go online
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
