import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Box, Typography, TextField, Button, Alert, Card, InputAdornment, IconButton, Link, Stack, Chip, Avatar, MenuItem
} from '@mui/material';
import { 
  Email as EmailIcon, Lock as LockIcon, Visibility, VisibilityOff, Storefront, Person as PersonIcon, Done as DoneIcon
} from '@mui/icons-material';
import { register, clearError } from '../../features/auth/authSlice';

const Signup = ({ themeMode }) => {
  const [regStep, setRegStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [shopRegData, setShopRegData] = useState({
    // Auth & Basic
    email: '',
    password: '',
    businessName: '',
    ownerName: '',
    phone: '',
    // Compliance
    businessType: 'RETAIL',
    gstNumber: '',
    panNumber: '',
    // Address
    addressType: 'BUSINESS',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: ''
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
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
      background: themeMode === 'dark' 
        ? 'radial-gradient(circle at 50% 50%, #1A2045 0%, #0A0C16 100%)' 
        : 'radial-gradient(circle at 50% 50%, #E2E8F0 0%, #F4F7FE 100%)',
      padding: 3
    }}>
      <Card sx={{ 
        maxWidth: 550, width: '100%', p: { xs: 4, md: 5 },
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        borderRadius: 4
      }}>
        <Box sx={{ 
          width: 60, height: 60, borderRadius: '20px', 
          background: 'linear-gradient(135deg, #EB455F 0%, #2B3467 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3,
          boxShadow: '0 8px 16px rgba(43, 52, 103, 0.2)'
        }}>
          <Storefront sx={{ color: 'white', fontSize: 32 }} />
        </Box>
        
        <Typography variant="h4" fontWeight="800" gutterBottom align="center">
          Register Your Shop
        </Typography>
        
        {error && <Alert severity="error" sx={{ width: '100%', mb: 3, borderRadius: '10px' }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleNext} sx={{ width: '100%', mt: 2 }}>
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 4, flexWrap: "wrap", gap: 1 }}>
            <Chip label="1. Profile" color={regStep >= 1 ? "primary" : "default"} sx={{ fontWeight: 700 }} />
            <Chip label="2. Business Info" color={regStep >= 2 ? "primary" : "default"} sx={{ fontWeight: 700 }} />
            <Chip label="3. Address" color={regStep >= 3 ? "primary" : "default"} sx={{ fontWeight: 700 }} />
          </Stack>

          {regStep === 1 && (
            <Stack spacing={2.5}>
              <TextField
                required fullWidth id="email" label="Email Address"
                name="email" type="email"
                value={shopRegData.email} onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment> }}
              />
              <TextField
                required fullWidth name="password" label="Password"
                type={showPassword ? 'text' : 'password'}
                value={shopRegData.password} onChange={handleChange}
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
              <TextField
                required fullWidth id="ownerName" label="Owner Name"
                name="ownerName"
                value={shopRegData.ownerName} onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="action" /></InputAdornment> }}
              />
              <TextField
                required fullWidth id="phone" label="Phone Number"
                name="phone" type="tel"
                value={shopRegData.phone} onChange={handleChange}
              />
            </Stack>
          )}

          {regStep === 2 && (
            <Stack spacing={2.5}>
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
            <Stack spacing={2.5}>
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
              <Button variant="outlined" onClick={() => setRegStep(regStep - 1)} fullWidth size="large" sx={{ py: 1.5, borderRadius: 2 }}>
                Back
              </Button>
            )}
            <Button type="submit" variant="contained" color="secondary" fullWidth size="large" sx={{ py: 1.5, borderRadius: 2 }} disabled={loading}>
              {regStep < 3 ? 'Next Step' : (loading ? 'Registering...' : 'Complete Registration')}
            </Button>
          </Box>
          
          <Typography align="center" variant="body2">
            Already have a seller account?{' '}
            <Link component={RouterLink} to="/login" color="primary" fontWeight="600" underline="hover">
              Sign In
            </Link>
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};
export default Signup;
