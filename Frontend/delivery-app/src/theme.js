import { createTheme } from '@mui/material/styles';

// Brand scales. The 50/100 keys matter: sx values like `bgcolor: 'success.50'`
// resolve by path into the palette, so without them those styles silently drop.
const brand = {
  50: '#FFF3ED',
  100: '#FFE0D1',
  200: '#FFC2A6',
  300: '#FF9E73',
  400: '#FF7A40',
  500: '#FF5C1A',
  600: '#F04A08',
  700: '#C43A05',
  800: '#932C04',
  900: '#6B2003',
};

const sky = {
  50: '#EEF6FF',
  100: '#D9EBFF',
  200: '#B6D8FF',
  300: '#85BEFF',
  400: '#4D9CFF',
  500: '#2179F5',
  600: '#125FD2',
  700: '#0E4BA8',
  800: '#0D3D85',
  900: '#0C3268',
};

const green = {
  50: '#ECFDF3',
  100: '#D1FADF',
  200: '#A6F4C5',
  300: '#6CE9A6',
  400: '#32D583',
  500: '#12B76A',
  600: '#039855',
  700: '#027A48',
  800: '#05603A',
  900: '#054F31',
};

const amber = {
  50: '#FFFAEB',
  100: '#FEF0C7',
  200: '#FEDF89',
  300: '#FEC84B',
  400: '#FDB022',
  500: '#F79009',
  600: '#DC6803',
  700: '#B54708',
  800: '#93370D',
  900: '#7A2E0E',
};

const red = {
  50: '#FEF3F2',
  100: '#FEE4E2',
  200: '#FECDCA',
  300: '#FDA29B',
  400: '#F97066',
  500: '#F04438',
  600: '#D92D20',
  700: '#B42318',
  800: '#912018',
  900: '#7A271A',
};

const slate = {
  50: '#F8FAFC',
  100: '#F1F5F9',
  200: '#E2E8F0',
  300: '#CBD5E1',
  400: '#94A3B8',
  500: '#64748B',
  600: '#475569',
  700: '#334155',
  800: '#1E293B',
  900: '#0F172A',
  A100: '#F1F5F9',
  A200: '#E2E8F0',
  A400: '#94A3B8',
  A700: '#334155',
};

// Design tokens shared by both modes.
export const layout = {
  sidebarWidth: 268,
  sidebarCollapsedWidth: 80,
  topbarHeight: 68,
  bottomNavHeight: 64,
  contentMaxWidth: 1440,
};

const withScale = (scale, extra) => ({ ...scale, ...extra });

const buildPalette = (mode) => {
  const isDark = mode === 'dark';

  return {
    mode,
    primary: withScale(brand, {
      main: brand[500],
      light: brand[300],
      dark: brand[700],
      contrastText: '#FFFFFF',
    }),
    secondary: withScale(sky, {
      main: sky[500],
      light: sky[300],
      dark: sky[700],
      contrastText: '#FFFFFF',
    }),
    success: withScale(green, {
      main: green[500],
      light: green[300],
      dark: green[700],
      contrastText: '#FFFFFF',
    }),
    warning: withScale(amber, {
      main: amber[500],
      light: amber[300],
      dark: amber[700],
      contrastText: '#FFFFFF',
    }),
    error: withScale(red, {
      main: red[500],
      light: red[300],
      dark: red[700],
      contrastText: '#FFFFFF',
    }),
    info: withScale(sky, {
      main: sky[400],
      light: sky[200],
      dark: sky[600],
      contrastText: '#FFFFFF',
    }),
    grey: slate,
    divider: isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(15, 23, 42, 0.09)',
    background: {
      default: isDark ? '#0B1120' : '#F6F8FB',
      paper: isDark ? '#131C2E' : '#FFFFFF',
      // Used for inset panels, list rows, map overlays.
      subtle: isDark ? '#1A2436' : slate[50],
    },
    text: {
      primary: isDark ? '#EAF0F7' : slate[900],
      secondary: isDark ? '#9BA9BD' : slate[500],
      disabled: isDark ? '#64748B' : slate[400],
    },
    action: {
      hover: isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(15, 23, 42, 0.035)',
      selected: isDark ? 'rgba(255, 92, 26, 0.16)' : 'rgba(255, 92, 26, 0.09)',
    },
  };
};

const shadow = (mode) =>
  mode === 'dark'
    ? {
        xs: '0 1px 2px rgba(0, 0, 0, 0.4)',
        sm: '0 2px 8px rgba(0, 0, 0, 0.45)',
        md: '0 8px 24px rgba(0, 0, 0, 0.5)',
        lg: '0 18px 44px rgba(0, 0, 0, 0.55)',
      }
    : {
        xs: '0 1px 2px rgba(15, 23, 42, 0.05)',
        sm: '0 2px 10px rgba(15, 23, 42, 0.06)',
        md: '0 10px 30px rgba(15, 23, 42, 0.08)',
        lg: '0 24px 52px rgba(15, 23, 42, 0.12)',
      };

export const getTheme = (mode = 'light') => {
  const palette = buildPalette(mode);
  const shadows = shadow(mode);
  const isDark = mode === 'dark';

  return createTheme({
    palette,
    // Exposed so components can reach for consistent elevation without
    // memorising rgba strings.
    customShadows: shadows,
    shape: { borderRadius: 14 },
    typography: {
      fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.03em' },
      h2: { fontWeight: 800, letterSpacing: '-0.025em' },
      h3: { fontWeight: 800, letterSpacing: '-0.02em' },
      h4: { fontWeight: 800, letterSpacing: '-0.02em', fontSize: 'clamp(1.5rem, 1.2rem + 1.1vw, 2rem)' },
      h5: { fontWeight: 700, letterSpacing: '-0.015em', fontSize: 'clamp(1.2rem, 1.05rem + 0.6vw, 1.5rem)' },
      h6: { fontWeight: 700, letterSpacing: '-0.01em', fontSize: 'clamp(1.05rem, 1rem + 0.3vw, 1.25rem)' },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      body1: { lineHeight: 1.6 },
      body2: { lineHeight: 1.6 },
      button: { fontWeight: 600, letterSpacing: 0 },
      overline: { fontWeight: 700, letterSpacing: '0.08em' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: { WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' },
          body: {
            backgroundColor: palette.background.default,
            // Keeps content clear of iOS notches / Android nav bars.
            paddingBottom: 'env(safe-area-inset-bottom)',
          },
          '*::-webkit-scrollbar': { width: 10, height: 10 },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: isDark ? 'rgba(148,163,184,0.28)' : 'rgba(15,23,42,0.16)',
            borderRadius: 8,
            border: `2px solid ${palette.background.default}`,
          },
          '*::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
          '@media (prefers-reduced-motion: reduce)': {
            '*': { animationDuration: '0.01ms !important', transitionDuration: '0.01ms !important' },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
          outlined: { borderColor: palette.divider },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: 18,
            border: `1px solid ${palette.divider}`,
            boxShadow: shadows.xs,
            backgroundImage: 'none',
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 12, textTransform: 'none', paddingInline: 18 },
          sizeLarge: { paddingBlock: 12, fontSize: '0.975rem' },
          containedPrimary: {
            boxShadow: `0 6px 16px ${isDark ? 'rgba(255,92,26,0.24)' : 'rgba(255,92,26,0.28)'}`,
            '&:hover': { boxShadow: `0 8px 20px rgba(255,92,26,0.34)` },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: { root: { borderRadius: 12 } },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 8, fontWeight: 600 },
          sizeSmall: { height: 24 },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: isDark ? 'rgba(148,163,184,0.06)' : '#FFFFFF',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: palette.divider },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: palette.grey[400] },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600, minHeight: 48 },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: { height: 3, borderRadius: 3 },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: { borderRadius: 8, fontSize: '0.75rem', paddingBlock: 6, paddingInline: 10 },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: { borderRadius: 12 },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: palette.divider },
          head: { fontWeight: 700, color: palette.text.secondary, whiteSpace: 'nowrap' },
        },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0, color: 'transparent' },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: { backgroundImage: 'none', borderColor: palette.divider },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 999, height: 8 },
          bar: { borderRadius: 999 },
        },
      },
      MuiAvatar: {
        styleOverrides: { root: { fontWeight: 700 } },
      },
      MuiSwitch: {
        styleOverrides: { root: { padding: 8 } },
      },
    },
  });
};

export default getTheme;
