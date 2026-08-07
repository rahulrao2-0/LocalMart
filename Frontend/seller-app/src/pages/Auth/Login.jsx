import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Box, Typography, TextField, Button, Alert, Card, InputAdornment, IconButton, Link, alpha, useTheme
} from '@mui/material';
import { 
  Email as EmailIcon, Lock as LockIcon, Visibility, VisibilityOff, Storefront
} from '@mui/icons-material';
import { login, clearError } from '../../features/auth/authSlice';

const Login = ({ themeMode }) => {
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

  const isDark = themeMode === 'dark';

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      bgcolor: 'background.default',
    }}>
      {/* Animated Background Elements */}
      <Box sx={{
        position: 'absolute', top: '-10%', left: '-10%', width: '40vw', height: '40vw',
        borderRadius: '50%', background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.4)} 0%, transparent 70%)`,
        filter: 'blur(60px)', animation: 'pulse-glow 8s infinite alternate'
      }} />
      <Box sx={{
        position: 'absolute', bottom: '-10%', right: '-10%', width: '35vw', height: '35vw',
        borderRadius: '50%', background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.3)} 0%, transparent 70%)`,
        filter: 'blur(60px)', animation: 'pulse-glow 10s infinite alternate-reverse'
      }} />

      <Card className="animate-fade-in glass-panel" sx={{ 
        maxWidth: 440, width: '100%', p: { xs: 4, md: 5 }, mx: 2,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        position: 'relative', zIndex: 1, borderRadius: 4,
      }}>
        <Box sx={{ 
          width: 72, height: 72, borderRadius: '24px', 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3,
          boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.3)}`
        }}>
          <Storefront sx={{ color: 'white', fontSize: 36 }} />
        </Box>
        
        <Typography variant="h4" fontWeight="900" gutterBottom align="center" sx={{ 
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          Seller Portal
        </Typography>
        <Typography variant="body1" color="textSecondary" align="center" sx={{ mb: 4, fontWeight: 500 }}>
          Welcome back! Please enter your details.
        </Typography>
        
        {error && <Alert severity="error" sx={{ width: '100%', mb: 3, borderRadius: '12px' }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal" required fullWidth id="email" label="Email Address"
            name="email" autoComplete="email" autoFocus
            value={credentials.email} onChange={handleChange}
            InputProps={{
              startAdornment: <InputAdornment position="start"><EmailIcon color="primary" /></InputAdornment>,
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal" required fullWidth name="password" label="Password"
            type={showPassword ? 'text' : 'password'} id="password"
            value={credentials.password} onChange={handleChange}
            InputProps={{
              startAdornment: <InputAdornment position="start"><LockIcon color="primary" /></InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 3 }}>
            <Link component="button" variant="body2" fontWeight="600" color="primary" underline="hover" onClick={(e) => e.preventDefault()}>
              Forgot password?
            </Link>
          </Box>

          <Button
            type="submit" fullWidth variant="contained" color="primary"
            sx={{ py: 1.8, fontSize: '1.05rem', fontWeight: 700, borderRadius: 3, mb: 3, letterSpacing: '0.05em' }} 
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </Button>
          
          <Typography align="center" variant="body1" color="textSecondary">
            Don't have a seller account?{' '}
            <Link component={RouterLink} to="/signup" color="secondary" fontWeight="700" underline="hover">
              Apply Now
            </Link>
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};
export default Login;
