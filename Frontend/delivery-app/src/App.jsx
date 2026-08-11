import React, { useMemo } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider, CssBaseline, Snackbar, Alert } from '@mui/material';
import AppRoutes from './routes/AppRoutes';
import { getTheme } from './theme';
import { clearToast } from './redux/features/uiSlice';

function GlobalToast() {
  const dispatch = useDispatch();
  const toast = useSelector((state) => state.ui.toast);

  return (
    <Snackbar
      open={Boolean(toast)}
      autoHideDuration={3200}
      onClose={() => dispatch(clearToast())}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ bottom: { xs: 'calc(80px + env(safe-area-inset-bottom))', md: 24 } }}
    >
      <Alert
        severity={toast?.severity || 'success'}
        variant="filled"
        onClose={() => dispatch(clearToast())}
        sx={{ borderRadius: 3, boxShadow: 6, alignItems: 'center' }}
      >
        {toast?.message}
      </Alert>
    </Snackbar>
  );
}

function App() {
  const themeMode = useSelector((state) => state.ui.themeMode);
  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppRoutes />
      </Router>
      <GlobalToast />
    </ThemeProvider>
  );
}

export default App;
