import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Paper, Grid, TextField, Button, Avatar, Tabs, Tab, MenuItem } from '@mui/material';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  
  const [tabIndex, setTabIndex] = useState(0);

  // General Profile
  const [formData, setFormData] = useState({
    ownerName: user?.ownerName || user?.name || '',
    email: user?.email || '',
    businessName: user?.businessName || '',
    phone: user?.phone || '',
    businessType: user?.businessType || 'RETAIL',
    gstNumber: user?.gstNumber || '',
    panNumber: user?.panNumber || '',
  });

  // Address
  const [addressData, setAddressData] = useState({
    addressType: 'BUSINESS',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  // Bank Account
  const [bankData, setBankData] = useState({
    accountHolderName: '',
    bankName: '',
    branchName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
  });

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleAddressChange = (e) => setAddressData({ ...addressData, [e.target.name]: e.target.value });
  const handleBankChange = (e) => setBankData({ ...bankData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Profile update functionality coming soon');
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 800 }}>Seller Profile</Typography>
      
      <Paper sx={{ p: 4, borderRadius: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: 'secondary.main', fontSize: 32 }}>
            {(formData.businessName || formData.ownerName || 'S').charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="700">{formData.businessName || 'Your Shop'}</Typography>
            <Typography color="text.secondary">{formData.ownerName}</Typography>
          </Box>
        </Box>

        <Tabs 
          value={tabIndex} 
          onChange={(e, newIndex) => setTabIndex(newIndex)} 
          sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Business Details" />
          <Tab label="Addresses" />
          <Tab label="Bank Account" />
        </Tabs>

        <form onSubmit={handleSubmit}>
          {/* TAB 1: BUSINESS DETAILS */}
          {tabIndex === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Owner Name" name="ownerName" value={formData.ownerName} onChange={handleFormChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Business / Shop Name" name="businessName" value={formData.businessName} onChange={handleFormChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Email Address" name="email" value={formData.email} disabled />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Phone Number" name="phone" value={formData.phone} onChange={handleFormChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select fullWidth label="Business Type" name="businessType" value={formData.businessType} onChange={handleFormChange}>
                  <MenuItem value="INDIVIDUAL">Individual</MenuItem>
                  <MenuItem value="RETAIL">Retail</MenuItem>
                  <MenuItem value="WHOLESALE">Wholesale</MenuItem>
                  <MenuItem value="MANUFACTURER">Manufacturer</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="PAN Number" name="panNumber" value={formData.panNumber} onChange={handleFormChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="GST Number" name="gstNumber" value={formData.gstNumber} onChange={handleFormChange} />
              </Grid>
            </Grid>
          )}

          {/* TAB 2: ADDRESSES */}
          {tabIndex === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField select fullWidth label="Address Type" name="addressType" value={addressData.addressType} onChange={handleAddressChange}>
                  <MenuItem value="BUSINESS">Business Address</MenuItem>
                  <MenuItem value="WAREHOUSE">Warehouse</MenuItem>
                  <MenuItem value="PICKUP">Pickup Location</MenuItem>
                  <MenuItem value="RETURN">Return Location</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Address Line 1" name="addressLine1" value={addressData.addressLine1} onChange={handleAddressChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Address Line 2" name="addressLine2" value={addressData.addressLine2} onChange={handleAddressChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="City" name="city" value={addressData.city} onChange={handleAddressChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="State" name="state" value={addressData.state} onChange={handleAddressChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Postal Code" name="postalCode" value={addressData.postalCode} onChange={handleAddressChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Country" name="country" value={addressData.country} onChange={handleAddressChange} disabled />
              </Grid>
            </Grid>
          )}

          {/* TAB 3: BANK ACCOUNT */}
          {tabIndex === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Account Holder Name" name="accountHolderName" value={bankData.accountHolderName} onChange={handleBankChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Bank Name" name="bankName" value={bankData.bankName} onChange={handleBankChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Branch Name" name="branchName" value={bankData.branchName} onChange={handleBankChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Account Number" name="accountNumber" value={bankData.accountNumber} onChange={handleBankChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="IFSC Code" name="ifscCode" value={bankData.ifscCode} onChange={handleBankChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="UPI ID (Optional)" name="upiId" value={bankData.upiId} onChange={handleBankChange} />
              </Grid>
            </Grid>
          )}

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained" color="primary" size="large" sx={{ px: 4, borderRadius: 2 }}>
              Save Changes
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Profile;
