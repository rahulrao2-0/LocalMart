import { createTheme, alpha } from "@mui/material/styles";

// ---------------------------------------------------------------------------
// Brand palette. Indigo + pink, shared by every surface in the app.
// ---------------------------------------------------------------------------
const BRAND = {
  primary: { main: "#4F46E5", light: "#818CF8", dark: "#3730A3" },
  secondary: { main: "#EC4899", light: "#F472B6", dark: "#BE185D" },
};

export const BRAND_GRADIENT = `linear-gradient(135deg, ${BRAND.primary.main} 0%, ${BRAND.secondary.main} 100%)`;

export const getTheme = (mode) => {
  const isDark = mode === "dark";

  // Mode-aware surface tints. Use these instead of `grey.50`/`grey.100`, which
  // are identical in both modes and turn dark mode unreadable.
  const surface = {
    subtle: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(15, 23, 42, 0.02)",
    muted: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(15, 23, 42, 0.04)",
    strong: isDark ? "rgba(255, 255, 255, 0.10)" : "rgba(15, 23, 42, 0.07)",
  };

  const border = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.07)";

  const shadow = {
    sm: isDark ? "0 2px 8px rgba(0,0,0,0.4)" : "0 2px 8px rgba(15,23,42,0.04)",
    md: isDark ? "0 8px 24px rgba(0,0,0,0.45)" : "0 8px 24px rgba(15,23,42,0.06)",
    lg: isDark ? "0 16px 48px rgba(0,0,0,0.55)" : "0 16px 48px rgba(15,23,42,0.10)",
  };

  return createTheme({
    palette: {
      mode,
      primary: { ...BRAND.primary, contrastText: "#FFFFFF" },
      secondary: { ...BRAND.secondary, contrastText: "#FFFFFF" },
      background: {
        default: isDark ? "#0B1120" : "#F6F7FB",
        paper: isDark ? "#141C2F" : "#FFFFFF",
        subtle: surface.subtle,
        muted: surface.muted,
      },
      text: {
        primary: isDark ? "#F1F5F9" : "#0F172A",
        secondary: isDark ? "#94A3B8" : "#64748B",
      },
      success: { main: "#10B981", light: "#34D399", dark: "#059669" },
      warning: { main: "#F59E0B", light: "#FBBF24", dark: "#D97706" },
      error: { main: "#EF4444", light: "#F87171", dark: "#DC2626" },
      info: { main: "#3B82F6", light: "#60A5FA", dark: "#2563EB" },
      divider: border,
    },

    // Exposed so components can reach the same tokens the overrides use.
    surface,
    softShadow: shadow,

    typography: {
      fontFamily:
        "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      // Headings shrink on small screens so page titles stay on one or two
      // lines at 360px instead of stacking into a wall of text.
      h1: { fontWeight: 800, letterSpacing: "-0.02em", fontSize: "2.25rem" },
      h2: { fontWeight: 800, letterSpacing: "-0.02em", fontSize: "1.875rem" },
      h3: { fontWeight: 700, letterSpacing: "-0.02em", fontSize: "1.625rem" },
      h4: {
        fontWeight: 800,
        letterSpacing: "-0.02em",
        fontSize: "1.375rem",
        "@media (min-width:600px)": { fontSize: "1.625rem" },
        "@media (min-width:900px)": { fontSize: "1.875rem" },
      },
      h5: {
        fontWeight: 700,
        letterSpacing: "-0.01em",
        fontSize: "1.125rem",
        "@media (min-width:600px)": { fontSize: "1.25rem" },
      },
      h6: {
        fontWeight: 700,
        fontSize: "1rem",
        "@media (min-width:600px)": { fontSize: "1.125rem" },
      },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      body2: { lineHeight: 1.6 },
      button: { fontWeight: 600, textTransform: "none", letterSpacing: "0.01em" },
      overline: { fontWeight: 700, letterSpacing: "0.08em" },
    },

    shape: { borderRadius: 14 },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: { WebkitFontSmoothing: "antialiased", colorScheme: mode },
          body: { overflowX: "hidden" },
          // Scrollbars follow the active mode (previously hardcoded in index.css).
          "*::-webkit-scrollbar": { width: 8, height: 8 },
          "*::-webkit-scrollbar-track": { background: "transparent" },
          "*::-webkit-scrollbar-thumb": {
            background: isDark ? "rgba(148,163,184,0.35)" : "rgba(100,116,139,0.35)",
            borderRadius: 8,
          },
          "*::-webkit-scrollbar-thumb:hover": {
            background: isDark ? "rgba(148,163,184,0.55)" : "rgba(100,116,139,0.55)",
          },
          // Visible keyboard focus everywhere, not just on MUI defaults.
          ":focus-visible": {
            outline: `2px solid ${BRAND.primary.main}`,
            outlineOffset: 2,
          },
          "@media (prefers-reduced-motion: reduce)": {
            "*, *::before, *::after": {
              animationDuration: "0.01ms !important",
              animationIterationCount: "1 !important",
              transitionDuration: "0.01ms !important",
              scrollBehavior: "auto !important",
            },
          },
        },
      },

      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: "9px 20px",
            transition: "background-color .2s ease, box-shadow .2s ease, transform .2s ease",
          },
          sizeSmall: { padding: "6px 14px" },
          sizeLarge: { padding: "12px 26px", fontSize: "1rem" },
          // The lift only belongs on solid buttons; on text/outlined buttons in
          // a toolbar it reads as jitter.
          contained: {
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: `0 8px 20px ${alpha(BRAND.primary.main, isDark ? 0.35 : 0.22)}`,
            },
            "&:active": { transform: "translateY(0)" },
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${BRAND.primary.main} 0%, ${BRAND.primary.dark} 100%)`,
            "&:hover": {
              background: `linear-gradient(135deg, ${BRAND.primary.light} 0%, ${BRAND.primary.main} 100%)`,
            },
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: { borderRadius: 12, transition: "background-color .2s ease" },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
          rounded: { borderRadius: 18 },
          outlined: { borderColor: border },
        },
      },

      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: 20,
            border: `1px solid ${border}`,
            backgroundColor: isDark ? "rgba(20, 28, 47, 0.72)" : "rgba(255, 255, 255, 0.78)",
            backdropFilter: "blur(12px)",
            boxShadow: shadow.md,
          },
        },
      },

      MuiTableContainer: {
        styleOverrides: { root: { overflowX: "auto" } },
      },

      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: border },
          // Mode-aware header tint replaces `bgcolor: 'grey.50'`.
          head: {
            backgroundColor: surface.subtle,
            fontWeight: 700,
            fontSize: "0.8125rem",
            color: isDark ? "#CBD5E1" : "#475569",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            paddingTop: 14,
            paddingBottom: 14,
            whiteSpace: "nowrap",
          },
        },
      },

      MuiTableRow: {
        styleOverrides: {
          root: {
            "&:last-child td, &:last-child th": { border: 0 },
            "&.MuiTableRow-hover:hover": { backgroundColor: surface.subtle },
          },
        },
      },

      MuiTextField: { defaultProps: { variant: "outlined" } },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: isDark ? "rgba(11, 17, 32, 0.5)" : "rgba(246, 247, 251, 0.7)",
            transition: "background-color .2s ease, box-shadow .2s ease",
            "&:hover": {
              backgroundColor: isDark ? "rgba(11, 17, 32, 0.75)" : "rgba(246, 247, 251, 1)",
            },
            "&.Mui-focused": {
              backgroundColor: isDark ? "rgba(11, 17, 32, 1)" : "#FFFFFF",
              boxShadow: `0 0 0 3px ${alpha(BRAND.primary.main, 0.15)}`,
            },
          },
          notchedOutline: { borderColor: border },
        },
      },

      MuiDialog: {
        defaultProps: {
          slotProps: { paper: { sx: { borderRadius: { xs: 0, sm: 3.5 } } } },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: { fontWeight: 800, fontSize: "1.125rem", padding: "20px 24px 8px" },
        },
      },
      MuiDialogActions: { styleOverrides: { root: { padding: "12px 24px 20px", gap: 8 } } },

      MuiMenu: {
        defaultProps: {
          slotProps: {
            paper: {
              elevation: 0,
              sx: {
                mt: 1,
                borderRadius: 3,
                border: `1px solid ${border}`,
                boxShadow: shadow.lg,
                backgroundImage: "none",
              },
            },
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            marginInline: 6,
            paddingBlock: 10,
            fontWeight: 500,
            "&:hover": { backgroundColor: alpha(BRAND.primary.main, 0.08) },
            "&.Mui-selected": { backgroundColor: alpha(BRAND.primary.main, 0.12) },
          },
        },
      },

      MuiTabs: {
        styleOverrides: {
          root: { minHeight: 48 },
          indicator: { height: 3, borderRadius: "3px 3px 0 0" },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            fontWeight: 700,
            textTransform: "none",
            minHeight: 48,
            fontSize: "0.9rem",
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 700, borderRadius: 8 },
          sizeSmall: { height: 24, fontSize: "0.7rem" },
          label: { paddingInline: 10 },
        },
      },

      MuiAvatar: { styleOverrides: { root: { fontWeight: 700 } } },

      MuiSelect: { styleOverrides: { root: { borderRadius: 12 } } },

      MuiTooltip: {
        defaultProps: { arrow: true },
        styleOverrides: {
          tooltip: {
            borderRadius: 8,
            fontWeight: 600,
            fontSize: "0.75rem",
            padding: "6px 10px",
          },
        },
      },

      MuiAlert: {
        styleOverrides: { root: { borderRadius: 12, fontWeight: 500, alignItems: "center" } },
      },

      MuiListItemButton: {
        styleOverrides: {
          root: { borderRadius: 12, transition: "background-color .2s ease" },
        },
      },

      MuiSkeleton: { styleOverrides: { root: { backgroundColor: surface.muted } } },

      MuiDrawer: { styleOverrides: { paper: { backgroundImage: "none", borderColor: border } } },
    },
  });
};
