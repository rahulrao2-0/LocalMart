import { createTheme } from "@mui/material/styles";

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: "#4F46E5", // Modern Indigo
        light: "#818CF8",
        dark: "#3730A3",
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: "#EC4899", // Vibrant Pink
        light: "#F472B6",
        dark: "#BE185D",
        contrastText: "#FFFFFF",
      },
      background: {
        default: mode === "dark" ? "#0f172a" : "#f8fafc",
        paper: mode === "dark" ? "#1e293b" : "#ffffff",
        subtle: mode === "dark" ? "#1e293b" : "#f1f5f9",
      },
      text: {
        primary: mode === "dark" ? "#f8fafc" : "#0f172a",
        secondary: mode === "dark" ? "#94a3b8" : "#64748b",
      },
      success: { main: "#10B981", light: "#D1FAE5" },
      warning: { main: "#F59E0B", light: "#FEF3C7" },
      error: { main: "#EF4444", light: "#FEE2E2" },
      info: { main: "#3B82F6", light: "#DBEAFE" },
      divider: mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
    },
    typography: {
      fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      h1: { fontWeight: 800, letterSpacing: "-0.02em" },
      h2: { fontWeight: 800, letterSpacing: "-0.02em" },
      h3: { fontWeight: 700, letterSpacing: "-0.01em" },
      h4: { fontWeight: 700, letterSpacing: "-0.01em" },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      body1: { fontWeight: 400 },
      button: { fontWeight: 600, textTransform: "none", letterSpacing: "0.02em" },
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
              boxShadow: mode === "dark" 
                ? "0px 8px 20px rgba(79, 70, 229, 0.3)" 
                : "0px 8px 20px rgba(79, 70, 229, 0.2)",
              transform: "translateY(-2px)",
            },
          },
          containedPrimary: {
            background: "linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            boxShadow: mode === "dark" 
              ? "0px 10px 40px rgba(0, 0, 0, 0.5)" 
              : "0px 10px 40px rgba(0, 0, 0, 0.03)",
            border: mode === "dark" 
              ? "1px solid rgba(255, 255, 255, 0.05)" 
              : "1px solid rgba(0, 0, 0, 0.04)",
            background: mode === "dark" ? "rgba(30, 41, 59, 0.7)" : "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(12px)",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 14,
              transition: "all 0.3s ease",
              backgroundColor: mode === "dark" ? "rgba(15, 23, 42, 0.6)" : "rgba(248, 250, 252, 0.8)",
              "&.Mui-focused": {
                boxShadow: "0px 4px 20px rgba(79, 70, 229, 0.15)",
                backgroundColor: mode === "dark" ? "rgba(15, 23, 42, 1)" : "#ffffff",
              },
            },
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            fontWeight: 700,
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 8,
          }
        }
      }
    },
  });
