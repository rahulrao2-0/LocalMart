import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, TextField, Button, Avatar, Tabs, Tab, MenuItem,
  Snackbar, Alert, Chip, Stack, useTheme, alpha,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/SaveRounded';
import StorefrontIcon from '@mui/icons-material/StorefrontRounded';
import PageHeader from '../../components/common/PageHeader';

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
  { value: 'RETURN', label: 'Return Location' },
];

const TABS = ['Business Details', 'Addresses', 'Bank Account'];

const Profile = () => {
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);

  const [tabIndex, setTabIndex] = useState(0);
  const [toastOpen, setToastOpen] = useState(false);

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
    setToastOpen(true);
  };

  const half = { xs: 12, sm: 6, lg: 4 };

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      <PageHeader
        title="Seller Profile"
        subtitle="Keep your business, pickup and payout details up to date."
      />

      <Paper sx={{ border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
        {/* Identity header — stacks and centers on phones */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            textAlign: { xs: 'center', sm: 'left' },
            gap: { xs: 2, sm: 3 },
            p: { xs: 2.5, sm: 3.5 },
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.1)} 0%, ${alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.14 : 0.05)} 100%)`,
          }}
        >
          <Avatar
            sx={{
              width: { xs: 72, sm: 84 },
              height: { xs: 72, sm: 84 },
              flexShrink: 0,
              fontSize: { xs: 28, sm: 34 },
              fontWeight: 800,
              bgcolor: 'secondary.main',
            }}
          >
            {(formData.businessName || formData.ownerName || 'S').charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {formData.businessName || 'Your Shop'}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 1.25 }}>
              {formData.ownerName || 'Seller account'}
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              sx={{ flexWrap: 'wrap', gap: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}
            >
              <Chip
                size="small"
                icon={<StorefrontIcon />}
                label={BUSINESS_TYPES.find((t) => t.value === formData.businessType)?.label || 'Retail'}
                sx={{ bgcolor: 'background.paper' }}
              />
              {formData.email && (
                <Chip size="small" label={formData.email} sx={{ bgcolor: 'background.paper' }} />
              )}
            </Stack>
          </Box>
        </Box>

        {/* Scrollable — three tabs do not fit a 360px viewport */}
        <Tabs
          value={tabIndex}
          onChange={(_, newIndex) => setTabIndex(newIndex)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ px: { xs: 1, sm: 2 }, borderBottom: `1px solid ${theme.palette.divider}` }}
        >
          {TABS.map((label) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>

        <form onSubmit={handleSubmit}>
          <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            {/* TAB 1: BUSINESS DETAILS */}
            {tabIndex === 0 && (
              <Grid container spacing={2.5}>
                <Grid size={half}>
                  <TextField fullWidth label="Owner Name" name="ownerName" value={formData.ownerName} onChange={handleFormChange} />
                </Grid>
                <Grid size={half}>
                  <TextField fullWidth label="Business / Shop Name" name="businessName" value={formData.businessName} onChange={handleFormChange} />
                </Grid>
                <Grid size={half}>
                  <TextField fullWidth label="Email Address" name="email" value={formData.email} disabled helperText="Email cannot be changed" />
                </Grid>
                <Grid size={half}>
                  <TextField fullWidth label="Phone Number" name="phone" value={formData.phone} onChange={handleFormChange} />
                </Grid>
                <Grid size={half}>
                  <TextField select fullWidth label="Business Type" name="businessType" value={formData.businessType} onChange={handleFormChange}>
                    {BUSINESS_TYPES.map((type) => (
                      <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={half}>
                  <TextField fullWidth label="PAN Number" name="panNumber" value={formData.panNumber} onChange={handleFormChange} />
                </Grid>
                <Grid size={half}>
                  <TextField fullWidth label="GST Number" name="gstNumber" value={formData.gstNumber} onChange={handleFormChange} />
                </Grid>
              </Grid>
            )}

            {/* TAB 2: ADDRESSES */}
            {tabIndex === 1 && (
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField select fullWidth label="Address Type" name="addressType" value={addressData.addressType} onChange={handleAddressChange}>
                    {ADDRESS_TYPES.map((type) => (
                      <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={12}>
                  <TextField fullWidth label="Address Line 1" name="addressLine1" value={addressData.addressLine1} onChange={handleAddressChange} />
                </Grid>
                <Grid size={12}>
                  <TextField fullWidth label="Address Line 2" name="addressLine2" value={addressData.addressLine2} onChange={handleAddressChange} />
                </Grid>
                <Grid size={half}>
                  <TextField fullWidth label="City" name="city" value={addressData.city} onChange={handleAddressChange} />
                </Grid>
                <Grid size={half}>
                  <TextField fullWidth label="State" name="state" value={addressData.state} onChange={handleAddressChange} />
                </Grid>
                <Grid size={half}>
                  <TextField fullWidth label="Postal Code" name="postalCode" value={addressData.postalCode} onChange={handleAddressChange} />
                </Grid>
                <Grid size={half}>
                  <TextField fullWidth label="Country" name="country" value={addressData.country} onChange={handleAddressChange} disabled />
                </Grid>
              </Grid>
            )}

            {/* TAB 3: BANK ACCOUNT */}
            {tabIndex === 2 && (
              <Grid container spacing={2.5}>
                <Grid size={half}>
                  <TextField fullWidth label="Account Holder Name" name="accountHolderName" value={bankData.accountHolderName} onChange={handleBankChange} />
                </Grid>
                <Grid size={half}>
                  <TextField fullWidth label="Bank Name" name="bankName" value={bankData.bankName} onChange={handleBankChange} />
                </Grid>
                <Grid size={half}>
                  <TextField fullWidth label="Branch Name" name="branchName" value={bankData.branchName} onChange={handleBankChange} />
                </Grid>
                <Grid size={half}>
                  <TextField fullWidth label="Account Number" name="accountNumber" value={bankData.accountNumber} onChange={handleBankChange} />
                </Grid>
                <Grid size={half}>
                  <TextField fullWidth label="IFSC Code" name="ifscCode" value={bankData.ifscCode} onChange={handleBankChange} />
                </Grid>
                <Grid size={half}>
                  <TextField fullWidth label="UPI ID (Optional)" name="upiId" value={bankData.upiId} onChange={handleBankChange} />
                </Grid>
              </Grid>
            )}
          </Box>

          {/* Sticky action bar — the forms are long enough that a bottom-of-page
              button meant scrolling past every field to save. */}
          <Box
            sx={{
              position: 'sticky',
              bottom: 0,
              display: 'flex',
              justifyContent: { xs: 'stretch', sm: 'flex-end' },
              gap: 1.5,
              px: { xs: 2.5, sm: 3.5 },
              py: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.paper',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<SaveIcon />}
              fullWidth={false}
              sx={{ px: 4, width: { xs: '100%', sm: 'auto' } }}
            >
              Save Changes
            </Button>
          </Box>
        </form>
      </Paper>

      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" variant="filled" onClose={() => setToastOpen(false)}>
          Profile updates are coming soon — your changes weren't saved yet.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
