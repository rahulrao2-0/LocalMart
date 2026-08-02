import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Switch, FormControlLabel, Divider, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const Settings = () => {
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: false,
    smsNotifications: true,
    darkMode: false,
    language: 'English',
  });

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleLanguageChange = (e) => {
    setSettings({ ...settings, language: e.target.value });
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Settings
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>App Preferences</Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box mb={3}>
              <FormControlLabel
                control={<Switch checked={settings.darkMode} onChange={() => handleToggle('darkMode')} />}
                label="Dark Mode"
              />
            </Box>
            
            <Box>
              <FormControl fullWidth size="small">
                <InputLabel>Language</InputLabel>
                <Select value={settings.language} label="Language" onChange={handleLanguageChange}>
                  <MenuItem value="English">English</MenuItem>
                  <MenuItem value="Spanish">Spanish</MenuItem>
                  <MenuItem value="French">French</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Notifications</Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box display="flex" flexDirection="column" gap={2}>
              <FormControlLabel
                control={<Switch checked={settings.pushNotifications} onChange={() => handleToggle('pushNotifications')} color="primary" />}
                label="Push Notifications"
              />
              <FormControlLabel
                control={<Switch checked={settings.emailNotifications} onChange={() => handleToggle('emailNotifications')} color="primary" />}
                label="Email Notifications"
              />
              <FormControlLabel
                control={<Switch checked={settings.smsNotifications} onChange={() => handleToggle('smsNotifications')} color="primary" />}
                label="SMS Alerts"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <Box mt={4} display="flex" justifyContent="flex-end">
        <Button variant="contained" color="primary" size="large">
          Save Settings
        </Button>
      </Box>
    </Box>
  );
};

export default Settings;
