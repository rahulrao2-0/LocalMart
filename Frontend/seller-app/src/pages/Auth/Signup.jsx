import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Alert, Card, InputAdornment, IconButton,
  Link, Stack, MenuItem, Stepper, Step, StepLabel, CircularProgress, alpha, useTheme,
} from '@mui/material';
import {
  Email as EmailIcon, Lock as LockIcon, Visibility, VisibilityOff, Storefront,
  Person as PersonIcon,
} from '@mui/icons-material';
import { register, clearError } from '../../features/auth/authSlice';

const STEPS = ['Profile', 'Business', 'Address'];

const BUSINESS_TYPES = [
  { value: 'INDIVIDUAL', label: 'Individual' },
  { value: 'RETAIL', label: 'Retail' },
  { value: 'WHOLESALE', label: 'Wholesale' },
  { value: 'MANUFACTURER', label: 'Manufacturer' },
];

const ADDRESS_TYPES = [
  { value: 'BUSINESS', label: 'Business Address' },
  { value: 'WAREHOUSE', label: 'Warehouse' },
  { value: 'PICKUP', label: 'Pickup Location' },
];

const Signup = () => {
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
      {/* Decorative glows — hidden on phones to save paint cost */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: '-5%',
          right: '-10%',
          width: '45vw',
          height: '45vw',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.32)} 0%, transparent 70%)`,
          filter: 'blur(70px)',
          animation: 'pulse-glow 9s infinite alternate',
          display: { xs: 'none', sm: 'block' },
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          bottom: '-10%',
          left: '-10%',
          width: '40vw',
          height: '40vw',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.3)} 0%, transparent 70%)`,
          filter: 'blur(60px)',
          animation: 'pulse-glow 11s infinite alternate-reverse',
          display: { xs: 'none', sm: 'block' },
        }}
      />

      <Card
        className="animate-fade-in"
        sx={{
          maxWidth: 580,
          width: '100%',
          p: { xs: 3, sm: 4, md: 5 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
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
            background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
            display: 'grid',
            placeItems: 'center',
            mb: 2.5,
            boxShadow: `0 12px 24px ${alpha(theme.palette.secondary.main, 0.3)}`,
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
            background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Partner With Us
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3, fontWeight: 500 }}>
          Create your seller account in just a few steps.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2.5 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleNext} sx={{ width: '100%' }}>
          {/* A real Stepper replaces three Chips that wrapped to two rows and
              conveyed no progress semantics to assistive tech. */}
          <Stepper
            activeStep={regStep - 1}
            alternativeLabel
            sx={{
              mb: 4,
              '& .MuiStepLabel-label': {
                mt: 0.75,
                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                fontWeight: 700,
              },
            }}
          >
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {regStep === 1 && (
            <Stack spacing={2.5} className="animate-fade-in">
              <TextField
                required fullWidth id="email" label="Email Address"
                name="email" type="email" autoComplete="email"
                value={shopRegData.email} onChange={handleChange}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="primary" fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                required fullWidth name="password" label="Password"
                type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                value={shopRegData.password} onChange={handleChange}
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
              <TextField
                required fullWidth id="ownerName" label="Owner Name"
                name="ownerName"
                value={shopRegData.ownerName} onChange={handleChange}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="primary" fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                required fullWidth id="phone" label="Phone Number"
                name="phone" type="tel" autoComplete="tel"
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
                {BUSINESS_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                ))}
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
                {ADDRESS_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Address Line 1" fullWidth required name="addressLine1"
                value={shopRegData.addressLine1} onChange={handleChange}
              />
              <TextField
                label="Address Line 2 (Optional)" fullWidth name="addressLine2"
                value={shopRegData.addressLine2} onChange={handleChange}
              />
              {/* Two side-by-side fields are unusable at 360px */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5}>
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

          <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={2} sx={{ mt: 4, mb: 3 }}>
            {regStep > 1 && (
              <Button
                variant="outlined"
                onClick={() => setRegStep(regStep - 1)}
                fullWidth
                size="large"
                sx={{ py: 1.5, fontWeight: 700 }}
              >
                Back
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
              sx={{ py: 1.5, fontWeight: 700 }}
            >
              {regStep < 3 ? 'Continue' : (loading ? 'Registering…' : 'Complete Setup')}
            </Button>
          </Stack>

          <Typography align="center" variant="body2" color="text.secondary">
            Already have a seller account?{' '}
            <Link component={RouterLink} to="/login" color="primary" underline="hover" sx={{ fontWeight: 700 }}>
              Sign In
            </Link>
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default Signup;
