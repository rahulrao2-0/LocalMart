import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Box, Typography, TextField, Button, Alert, Card, InputAdornment, IconButton, Link, Stack, Chip, Avatar, MenuItem, alpha, useTheme
} from '@mui/material';
import { 
  Email as EmailIcon, Lock as LockIcon, Visibility, VisibilityOff, Storefront, Person as PersonIcon, Done as DoneIcon
} from '@mui/icons-material';
import { register, clearError } from '../../features/auth/authSlice';

const Signup = ({ themeMode }) => {
  const [regStep, setRegStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [shopRegData, setShopRegData] = useState({
    email: '', password: '', businessName: '', ownerName: '', phone: '',
    businessType: 'RETAIL', gstNumber: '', panNumber: '',
    addressType: 'BUSINESS', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: ''
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
    return () => dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch]);

  const handleChange = (e) => {
    setShopRegData({ ...shopRegData, [e.target.name]: e.target.value });
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (regStep < 3) {
      setRegStep(regStep + 1);
    } else {
      dispatch(register({ ...shopRegData, role: 'SELLER' }));
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      bgcolor: 'background.default',
      py: 4
    }}>
      {/* Animated Background Elements */}
      <Box sx={{
        position: 'absolute', top: '-5%', right: '-10%', width: '45vw', height: '45vw',
        borderRadius: '50%', background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.4)} 0%, transparent 70%)`,
        filter: 'blur(70px)', animation: 'pulse-glow 9s infinite alternate'
      }} />
      <Box sx={{
        position: 'absolute', bottom: '-10%', left: '-10%', width: '40vw', height: '40vw',
        borderRadius: '50%', background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.35)} 0%, transparent 70%)`,
        filter: 'blur(60px)', animation: 'pulse-glow 11s infinite alternate-reverse'
      }} />

      <Card className="animate-fade-in glass-panel" sx={{ 
        maxWidth: 580, width: '100%', p: { xs: 4, md: 5 }, mx: 2,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        position: 'relative', zIndex: 1, borderRadius: 4,
      }}>
        <Box sx={{ 
          width: 72, height: 72, borderRadius: '24px', 
          background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3,
          boxShadow: `0 12px 24px ${alpha(theme.palette.secondary.main, 0.3)}`
        }}>
          <Storefront sx={{ color: 'white', fontSize: 36 }} />
        </Box>
        
        <Typography variant="h4" fontWeight="900" gutterBottom align="center" sx={{ 
          background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          Partner With Us
        </Typography>
        <Typography variant="body1" color="textSecondary" align="center" sx={{ mb: 3, fontWeight: 500 }}>
          Create your seller account in just a few steps.
        </Typography>
        
        {error && <Alert severity="error" sx={{ width: '100%', mb: 3, borderRadius: '12px' }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleNext} sx={{ width: '100%' }}>
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 4, flexWrap: "wrap", gap: 1 }}>
            <Chip 
              label="1. Profile" 
              color={regStep >= 1 ? "primary" : "default"} 
              sx={{ fontWeight: 700, borderRadius: 2 }} 
            />
            <Chip 
              label="2. Business Info" 
              color={regStep >= 2 ? "primary" : "default"} 
              sx={{ fontWeight: 700, borderRadius: 2 }} 
            />
            <Chip 
              label="3. Address" 
              color={regStep >= 3 ? "primary" : "default"} 
              sx={{ fontWeight: 700, borderRadius: 2 }} 
            />
          </Stack>

          {regStep === 1 && (
            <Stack spacing={2.5} className="animate-fade-in">
              <TextField
                required fullWidth id="email" label="Email Address"
                name="email" type="email"
                value={shopRegData.email} onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="primary" /></InputAdornment> }}
              />
              <TextField
                required fullWidth name="password" label="Password"
                type={showPassword ? 'text' : 'password'}
                value={shopRegData.password} onChange={handleChange}
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
              <TextField
                required fullWidth id="ownerName" label="Owner Name"
                name="ownerName"
                value={shopRegData.ownerName} onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="primary" /></InputAdornment> }}
              />
              <TextField
                required fullWidth id="phone" label="Phone Number"
                name="phone" type="tel"
                value={shopRegData.phone} onChange={handleChange}
              />
            </Stack>
          )}

          {regStep === 2 && (
            <Stack spacing={2.5} className="animate-fade-in">
              <TextField
                label="Business / Shop Name" fullWidth required name="businessName"
                value={shopRegData.businessName} onChange={handleChange}
              />
              <TextField
                select label="Business Type" fullWidth required name="businessType"
                value={shopRegData.businessType} onChange={handleChange}
              >
                <MenuItem value="INDIVIDUAL">Individual</MenuItem>
                <MenuItem value="RETAIL">Retail</MenuItem>
                <MenuItem value="WHOLESALE">Wholesale</MenuItem>
                <MenuItem value="MANUFACTURER">Manufacturer</MenuItem>
              </TextField>
              <TextField
                label="PAN Number" fullWidth required name="panNumber"
                value={shopRegData.panNumber} onChange={handleChange}
              />
              <TextField
                label="GST Number (Optional)" fullWidth name="gstNumber"
                value={shopRegData.gstNumber} onChange={handleChange}
              />
            </Stack>
          )}

          {regStep === 3 && (
            <Stack spacing={2.5} className="animate-fade-in">
              <TextField
                select label="Address Type" fullWidth required name="addressType"
                value={shopRegData.addressType} onChange={handleChange}
              >
                <MenuItem value="BUSINESS">Business Address</MenuItem>
                <MenuItem value="WAREHOUSE">Warehouse</MenuItem>
                <MenuItem value="PICKUP">Pickup Location</MenuItem>
              </TextField>
              <TextField
                label="Address Line 1" fullWidth required name="addressLine1"
                value={shopRegData.addressLine1} onChange={handleChange}
              />
              <TextField
                label="Address Line 2 (Optional)" fullWidth name="addressLine2"
                value={shopRegData.addressLine2} onChange={handleChange}
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  label="City" fullWidth required name="city"
                  value={shopRegData.city} onChange={handleChange}
                />
                <TextField
                  label="Postal Code" fullWidth required name="postalCode"
                  value={shopRegData.postalCode} onChange={handleChange}
                />
              </Stack>
              <TextField
                label="State" fullWidth required name="state"
                value={shopRegData.state} onChange={handleChange}
              />
            </Stack>
          )}

          <Box sx={{ display: "flex", gap: 2, mt: 4, mb: 3 }}>
            {regStep > 1 && (
              <Button variant="outlined" onClick={() => setRegStep(regStep - 1)} fullWidth size="large" sx={{ py: 1.5, borderRadius: 3, fontWeight: 700 }}>
                Back
              </Button>
            )}
            <Button type="submit" variant="contained" color="primary" fullWidth size="large" sx={{ py: 1.5, borderRadius: 3, fontWeight: 700 }} disabled={loading}>
              {regStep < 3 ? 'Continue' : (loading ? 'Registering...' : 'Complete Setup')}
            </Button>
          </Box>
          
          <Typography align="center" variant="body1" color="textSecondary">
            Already have a seller account?{' '}
            <Link component={RouterLink} to="/login" color="primary" fontWeight="700" underline="hover">
              Sign In
            </Link>
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};
export default Signup;
