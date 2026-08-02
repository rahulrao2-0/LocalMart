import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Grid, TextField, Button, Avatar, Divider, IconButton 
} from '@mui/material';
import { PhotoCamera, Save } from '@mui/icons-material';

const Profile = () => {
  const [profileData, setProfileData] = useState({
    name: 'Demo Driver',
    email: 'driver@localmart.com',
    phone: '+1 234 567 8900',
    vehicleType: 'Motorcycle',
    vehicleNumber: 'ABC-1234',
    licenseNumber: 'DL-987654321',
    emergencyContact: '+1 987 654 3210'
  });

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        My Profile
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 4, borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 2 }}>
            <Box position="relative">
              <Avatar sx={{ width: 120, height: 120, mb: 2, bgcolor: 'primary.main', fontSize: 40 }}>
                {profileData.name.charAt(0)}
              </Avatar>
              <IconButton 
                color="primary" 
                sx={{ position: 'absolute', bottom: 10, right: -10, bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'grey.100' } }}
              >
                <PhotoCamera />
              </IconButton>
            </Box>
            <Typography variant="h6" fontWeight="bold">{profileData.name}</Typography>
            <Typography variant="body2" color="text.secondary">Delivery Partner</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Personal Information</Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Full Name" name="name" value={profileData.name} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Email Address" name="email" value={profileData.email} onChange={handleChange} disabled />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Phone Number" name="phone" value={profileData.phone} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Emergency Contact" name="emergencyContact" value={profileData.emergencyContact} onChange={handleChange} />
              </Grid>
            </Grid>

            <Typography variant="h6" fontWeight="bold" mt={4} mb={2}>Vehicle Information</Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Vehicle Type" name="vehicleType" value={profileData.vehicleType} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Vehicle Number" name="vehicleNumber" value={profileData.vehicleNumber} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Driving License" name="licenseNumber" value={profileData.licenseNumber} onChange={handleChange} />
              </Grid>
            </Grid>

            <Box display="flex" justifyContent="flex-end" mt={4}>
              <Button variant="contained" color="primary" size="large" startIcon={<Save />}>
                Save Changes
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
