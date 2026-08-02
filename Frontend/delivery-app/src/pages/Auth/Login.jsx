import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Link as MuiLink, Alert, CircularProgress } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../redux/features/authSlice';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(login(formData));
    if (login.fulfilled.match(resultAction)) {
      navigate('/dashboard');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h5" fontWeight="bold" textAlign="center" mb={1}>
        Welcome Back
      </Typography>
      
      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        label="Email Address"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        fullWidth
        required
        variant="outlined"
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        fullWidth
        required
        variant="outlined"
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
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
      </Button>

      <Box display="flex" justifyContent="space-between" mt={2}>
        <MuiLink component={Link} to="/forgot-password" variant="body2">
          Forgot Password?
        </MuiLink>
        <MuiLink component={Link} to="/signup" variant="body2">
          Don't have an account? Sign Up
        </MuiLink>
      </Box>
    </Box>
  );
};

export default Login;
