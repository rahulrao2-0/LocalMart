import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Box, Typography, TextField, Button, Alert, Card, InputAdornment, IconButton, Link
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
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
    return () => dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch]);

  const handleChange = (e) => setCredentials({ ...credentials, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); dispatch(login(credentials)); };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: themeMode === 'dark' 
        ? 'radial-gradient(circle at 50% 50%, #1A2045 0%, #0A0C16 100%)' 
        : 'radial-gradient(circle at 50% 50%, #E2E8F0 0%, #F4F7FE 100%)',
      padding: 3
    }}>
      <Card sx={{ 
        maxWidth: 420, width: '100%', p: { xs: 4, md: 5 },
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        <Box sx={{ 
          width: 60, height: 60, borderRadius: '20px', 
          background: 'linear-gradient(135deg, #2B3467 0%, #EB455F 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3,
          boxShadow: '0 8px 16px rgba(235, 69, 95, 0.2)'
        }}>
          <Storefront sx={{ color: 'white', fontSize: 32 }} />
        </Box>
        
        <Typography variant="h4" fontWeight="800" gutterBottom>
          Seller Portal
        </Typography>
        <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 4 }}>
          Welcome back! Please enter your details to manage your store.
        </Typography>
        
        {error && <Alert severity="error" sx={{ width: '100%', mb: 3, borderRadius: '10px' }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal" required fullWidth id="email" label="Email Address"
            name="email" autoComplete="email" autoFocus
            value={credentials.email} onChange={handleChange}
            InputProps={{
              startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment>,
            }}
          />
          <TextField
            margin="normal" required fullWidth name="password" label="Password"
            type={showPassword ? 'text' : 'password'} id="password"
            value={credentials.password} onChange={handleChange}
            InputProps={{
              startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Button
            type="submit" fullWidth variant="contained" color="primary"
            sx={{ mt: 4, mb: 3, py: 1.5, fontSize: '1rem' }} disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </Button>
          
          <Typography align="center" variant="body2">
            Don't have a seller account?{' '}
            <Link component={RouterLink} to="/signup" color="secondary" fontWeight="600" underline="hover">
              Apply Now
            </Link>
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};
export default Login;
