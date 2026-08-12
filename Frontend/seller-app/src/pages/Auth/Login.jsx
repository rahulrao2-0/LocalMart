import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Alert, Card, InputAdornment, IconButton,
  Link, CircularProgress, alpha, useTheme,
} from '@mui/material';
import {
  Email as EmailIcon, Lock as LockIcon, Visibility, VisibilityOff, Storefront,
} from '@mui/icons-material';
import { login, clearError } from '../../features/auth/authSlice';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
    return () => dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch]);

  const handleChange = (e) => setCredentials({ ...credentials, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); dispatch(login(credentials)); };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'background.default',
        px: 2,
        py: { xs: 4, sm: 6 },
      }}
    >
      {/* Decorative glows — hidden on phones, where the blur costs more paint
          time than it adds, and disabled under reduced-motion via CssBaseline. */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          width: '40vw',
          height: '40vw',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.35)} 0%, transparent 70%)`,
          filter: 'blur(60px)',
          animation: 'pulse-glow 8s infinite alternate',
          display: { xs: 'none', sm: 'block' },
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          bottom: '-10%',
          right: '-10%',
          width: '35vw',
          height: '35vw',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.28)} 0%, transparent 70%)`,
          filter: 'blur(60px)',
          animation: 'pulse-glow 10s infinite alternate-reverse',
          display: { xs: 'none', sm: 'block' },
        }}
      />

      <Card
        className="animate-fade-in"
        sx={{
          maxWidth: 440,
          width: '100%',
          p: { xs: 3, sm: 4, md: 5 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
          // Theme-aware translucency; the old `.glass-panel` class hardcoded a
          // white background and never matched its `.dark` selector.
          bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.75 : 0.85),
          backdropFilter: 'blur(16px)',
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            width: { xs: 60, sm: 72 },
            height: { xs: 60, sm: 72 },
            borderRadius: '24px',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            display: 'grid',
            placeItems: 'center',
            mb: 2.5,
            boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
          }}
        >
          <Storefront sx={{ color: '#fff', fontSize: { xs: 30, sm: 36 } }} />
        </Box>

        <Typography
          variant="h4"
          align="center"
          sx={{
            fontWeight: 900,
            mb: 0.75,
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Seller Portal
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3.5, fontWeight: 500 }}>
          Welcome back! Please enter your details.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2.5 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            required fullWidth id="email" label="Email Address"
            name="email" autoComplete="email" autoFocus
            value={credentials.email} onChange={handleChange}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            required fullWidth name="password" label="Password"
            type={showPassword ? 'text' : 'password'} id="password"
            autoComplete="current-password"
            value={credentials.password} onChange={handleChange}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5, mb: 3 }}>
            <Link
              component="button"
              type="button"
              variant="body2"
              color="primary"
              underline="hover"
              onClick={(e) => e.preventDefault()}
              sx={{ fontWeight: 600 }}
            >
              Forgot password?
            </Link>
          </Box>

          <Button
            type="submit" fullWidth variant="contained" size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
            sx={{ py: 1.6, fontSize: '1rem', fontWeight: 700, mb: 3 }}
          >
            {loading ? 'Authenticating…' : 'Sign In to Dashboard'}
          </Button>

          <Typography align="center" variant="body2" color="text.secondary">
            Don't have a seller account?{' '}
            <Link component={RouterLink} to="/signup" color="secondary" underline="hover" sx={{ fontWeight: 700 }}>
              Apply Now
            </Link>
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default Login;
