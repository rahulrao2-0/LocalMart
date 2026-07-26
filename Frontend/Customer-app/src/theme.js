import { createTheme } from "@mui/material/styles";

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: "#6C5DD3", // Modern Royal Violet
        light: "#A499F1",
        dark: "#4E3EAB",
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: "#FF7551", // Fresh Neon Coral
        light: "#FF9C84",
        dark: "#C64625",
        contrastText: "#FFFFFF",
      },
      background: {
        default: mode === "dark" ? "#0F111A" : "#F7F9FC",
        paper: mode === "dark" ? "#161925" : "#FFFFFF",
        subtle: mode === "dark" ? "#1C2035" : "#EDF2F7",
      },
      text: {
        primary: mode === "dark" ? "#F1F5F9" : "#1E293B",
        secondary: mode === "dark" ? "#94A3B8" : "#64748B",
      },
      success: {
        main: "#10B981", // Emerald Green
        light: "#D1FAE5",
      },
      warning: {
        main: "#F59E0B", // Amber
        light: "#FEF3C7",
      },
      error: {
        main: "#EF4444", // Rose Red
        light: "#FEE2E2",
      },
      divider: mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
    },
    typography: {
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      h1: { fontWeight: 800 },
      h2: { fontWeight: 800 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 500 },
      body1: { fontWeight: 400 },
      body2: { fontWeight: 400 },
      button: {
        fontWeight: 600,
        textTransform: "none",
      },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: "8px 16px",
            boxShadow: "none",
            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              boxShadow: "0px 4px 12px rgba(108, 93, 211, 0.15)",
              transform: "translateY(-1px)",
            },
          },
          containedPrimary: {
            background: "linear-gradient(135deg, #6C5DD3 0%, #5142B3 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #7C6EE6 0%, #6051C4 100%)",
              boxShadow: "0px 6px 16px rgba(108, 93, 211, 0.3)",
            },
          },
          containedSecondary: {
            background: "linear-gradient(135deg, #FF7551 0%, #E05C3A 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #FF8D6F 0%, #ED6C4B 100%)",
              boxShadow: "0px 6px 16px rgba(255, 117, 81, 0.3)",
            },
          },
          outlined: {
            borderWidth: "1.5px",
            "&:hover": {
              borderWidth: "1.5px",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: mode === "dark" 
              ? "0px 10px 30px rgba(0, 0, 0, 0.5)" 
              : "0px 10px 30px rgba(108, 93, 211, 0.04)",
            border: mode === "dark" 
              ? "1px solid rgba(255, 255, 255, 0.05)" 
              : "1px solid rgba(108, 93, 211, 0.06)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            overflow: "hidden",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          outlined: {
            borderColor: mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(108, 93, 211, 0.08)",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 10,
          },
        },
      },
      MuiToggleButtonGroup: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: mode === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.08)",
            padding: 3,
            backgroundColor: mode === "dark" ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)",
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            border: "none !important",
            borderRadius: "10px !important",
            padding: "6px 14px",
            transition: "all 0.2s ease",
            "&.Mui-selected": {
              boxShadow: "0px 4px 12px rgba(108, 93, 211, 0.12)",
            },
          },
        },
      },
    },
  });
