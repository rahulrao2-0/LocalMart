import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOtp, clearError } from '../../redux/features/authSlice';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const location = useLocation();
  const email = location.state?.email || '';
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setOtp(e.target.value);
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(verifyOtp({ email, otp }));
    if (verifyOtp.fulfilled.match(resultAction)) {
      navigate('/dashboard');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h5" fontWeight="bold" textAlign="center" mb={1}>
        Verify Your Account
      </Typography>
      
      <Typography variant="body2" textAlign="center" color="text.secondary" mb={2}>
        We sent a code to {email || 'your email'}
      </Typography>
      
      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        label="OTP Code"
        name="otp"
        value={otp}
        onChange={handleChange}
        fullWidth
        required
        autoFocus
      />
      
      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        disabled={loading || !otp}
        fullWidth
        sx={{ mt: 2, py: 1.5 }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify'}
      </Button>
    </Box>
  );
};

export default VerifyOtp;
