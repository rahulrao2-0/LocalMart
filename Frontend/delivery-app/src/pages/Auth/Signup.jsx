import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Link as MuiLink, Alert, CircularProgress } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../../redux/features/authSlice';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [validationError, setValidationError] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) dispatch(clearError());
    if (validationError) setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }
    
    // Create payload matching expected backend structure
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password
    };

    const resultAction = await dispatch(register(payload));
    if (register.fulfilled.match(resultAction)) {
      // If backend requires OTP, navigate there, else dashboard
      // Assuming it goes to dashboard immediately based on previous code or VerifyOtp
      if (resultAction.payload.accessToken) {
        navigate('/dashboard');
      } else {
        navigate('/verify-otp', { state: { email: formData.email } });
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h5" fontWeight="bold" textAlign="center" mb={1}>
        Join as Delivery Partner
      </Typography>
      
      {(error || validationError) && <Alert severity="error">{validationError || error}</Alert>}

      <TextField
        label="Full Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        fullWidth
        required
      />
      <TextField
        label="Email Address"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        fullWidth
        required
      />
      <TextField
        label="Phone Number"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        fullWidth
        required
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        fullWidth
        required
      />
      <TextField
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
        fullWidth
        required
      />
      
      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        disabled={loading}
        fullWidth
        sx={{ mt: 2, py: 1.5 }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
      </Button>

      <Box display="flex" justifyContent="center" mt={2}>
        <MuiLink component={Link} to="/login" variant="body2">
          Already have an account? Log In
        </MuiLink>
      </Box>
    </Box>
  );
};

export default Signup;
