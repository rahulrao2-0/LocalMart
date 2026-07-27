import { useState, useMemo } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { Routes, Route } from "react-router-dom";

import { getTheme } from "./theme";

import HomePage from "./HomePage/Homepage";
import LoginPage from "./Auth/LoginPage";
import SignupPage from "./Auth/SignupPage";

import "./App.css";

function App() {
  const [themeMode, setThemeMode] = useState("light");

  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              themeMode={themeMode}
              onToggleTheme={toggleTheme}
            />
          }
        />

        <Route
          path="/login"
          element={
            <LoginPage
              themeMode={themeMode}
            />
          }
        />

        <Route
          path="/signup"
          element={
            <SignupPage
              themeMode={themeMode}
            />
          }
        />
      </Routes>
    </ThemeProvider>
  );
}

export default App;