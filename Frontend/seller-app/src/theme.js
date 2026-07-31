import { createTheme } from "@mui/material/styles";

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: "#2B3467", // Elite Deep Navy for Sellers
        light: "#4E5C9A",
        dark: "#1A2045",
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: "#EB455F", // Vibrant Ruby Red
        light: "#F07387",
        dark: "#B83248",
        contrastText: "#FFFFFF",
      },
      background: {
        default: mode === "dark" ? "#0A0C16" : "#F4F7FE",
        paper: mode === "dark" ? "#111424" : "#FFFFFF",
        subtle: mode === "dark" ? "#1A1D36" : "#E2E8F0",
      },
      text: {
        primary: mode === "dark" ? "#F8FAFC" : "#0F172A",
        secondary: mode === "dark" ? "#94A3B8" : "#64748B",
      },
      success: { main: "#10B981", light: "#D1FAE5" },
      warning: { main: "#F59E0B", light: "#FEF3C7" },
      error: { main: "#EF4444", light: "#FEE2E2" },
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
      body1: { fontWeight: 400 },
      button: { fontWeight: 600, textTransform: "none" },
    },
    shape: { borderRadius: 16 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: "10px 24px",
            boxShadow: "none",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              boxShadow: "0px 8px 20px rgba(43, 52, 103, 0.2)",
              transform: "translateY(-2px)",
            },
          },
          containedPrimary: {
            background: "linear-gradient(135deg, #2B3467 0%, #1A2045 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #3A457D 0%, #2B3467 100%)",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            boxShadow: mode === "dark" 
              ? "0px 10px 40px rgba(0, 0, 0, 0.5)" 
              : "0px 10px 40px rgba(43, 52, 103, 0.05)",
            border: mode === "dark" 
              ? "1px solid rgba(255, 255, 255, 0.05)" 
              : "1px solid rgba(255, 255, 255, 0.5)",
            background: mode === "dark" ? "#111424" : "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 12,
              transition: "all 0.3s ease",
              "&.Mui-focused": {
                boxShadow: "0px 4px 20px rgba(43, 52, 103, 0.1)",
              },
            },
          },
        },
      },
    },
  });
