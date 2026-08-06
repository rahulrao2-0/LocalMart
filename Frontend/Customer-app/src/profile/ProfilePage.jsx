import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../features/auth/authSlice";
import {
  getProfileApi,
  updateProfileApi,
  uploadAvatarApi,
  addAddressApi,
  updateAddressApi,
  deleteAddressApi,
} from "../services/userApi.js";

import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Avatar,
  Button,
  TextField,
  Stack,
  Alert,
  IconButton,
  Chip,
  Tabs,
  Tab,
  Tooltip,
  Card,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
} from "@mui/material";

import {
  PhotoCamera,
  Edit as EditIcon,
  Save as SaveIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  VerifiedUserOutlined,
  BadgeOutlined,
  SecurityOutlined,
  Add as AddIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";

export default function ProfilePage({ themeMode }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const authUser = useSelector((state) => state.auth.user);

  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    bio: "",
    profileImage: { url: "", publicId: "" },
    addresses: [],
  });

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false,
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getProfileApi();
      if (res.success && res.profile) {
        const profileData = { ...res.profile };
        if (!profileData.fullName || profileData.fullName === "LocalMart User") {
          profileData.fullName = authUser?.full_name || authUser?.fullName || "LocalMart User";
        }
        setProfile(profileData);
        dispatch(setUser({ ...authUser, ...profileData }));
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      setErrorMsg(err.message || "Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setAvatarUploading(true);
      setErrorMsg("");
      const formData = new FormData();
      formData.append("image", file);

      const res = await uploadAvatarApi(formData);
      if (res.success) {
        setProfile((prev) => ({ ...prev, profileImage: res.profileImage }));
        setSuccessMsg("Profile avatar updated successfully!");
        setTimeout(() => setSuccessMsg(""), 3500);
      }
    } catch (err) {
      console.error("Avatar Upload Error:", err);
      setErrorMsg(err.message || "Failed to upload image.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    try {
      setActionLoading(true);
      setErrorMsg("");
      const res = await updateProfileApi({
        fullName: profile.fullName,
        phone: profile.phone,
        bio: profile.bio,
      });

      if (res.success) {
        setIsEditing(false);
        dispatch(setUser({ ...authUser, ...res.profile }));
        setSuccessMsg("Profile details saved successfully!");
        setTimeout(() => setSuccessMsg(""), 3500);
      }
    } catch (err) {
      console.error("Update Profile Error:", err);
      setErrorMsg(err.message || "Failed to update profile.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenAddressModal = (addr = null) => {
    if (addr) {
      setEditingAddressId(addr._id);
      setAddressForm({
        street: addr.street,
        city: addr.city,
        state: addr.state,
        postalCode: addr.postalCode,
        country: addr.country || "India",
        isDefault: addr.isDefault || false,
      });
    } else {
      setEditingAddressId(null);
      setAddressForm({
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
        isDefault: profile.addresses.length === 0,
      });
    }
    setAddressModalOpen(true);
  };

  const handleSaveAddress = async () => {
    try {
      setActionLoading(true);
      setErrorMsg("");
      let res;
      if (editingAddressId) {
        res = await updateAddressApi(editingAddressId, addressForm);
      } else {
        res = await addAddressApi(addressForm);
      }

      if (res.success) {
        setProfile((prev) => ({ ...prev, addresses: res.addresses }));
        setAddressModalOpen(false);
        setSuccessMsg(editingAddressId ? "Address updated!" : "New address added!");
        setTimeout(() => setSuccessMsg(""), 3500);
      }
    } catch (err) {
      console.error("Address Save Error:", err);
      setErrorMsg(err.message || "Failed to save address.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      setActionLoading(true);
      setErrorMsg("");
      const res = await deleteAddressApi(addressId);
      if (res.success) {
        setProfile((prev) => ({ ...prev, addresses: res.addresses }));
        setSuccessMsg("Address removed successfully!");
        setTimeout(() => setSuccessMsg(""), 3500);
      }
    } catch (err) {
      console.error("Delete Address Error:", err);
      setErrorMsg(err.message || "Failed to delete address.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 8, position: "relative" }}>
      <Box
        sx={{
          height: { xs: 160, sm: 220, md: 260 },
          width: "100%",
          background: "linear-gradient(135deg, #6C5DD3 0%, #8E82E0 45%, #FF7551 100%)",
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          pt: { xs: 2, sm: 3 },
          px: { xs: 2, sm: 4 },
        }}
      >
        <Button
          onClick={() => navigate("/")}
          startIcon={<ArrowBackIcon />}
          sx={{
            color: "#FFFFFF",
            bgcolor: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(12px)",
            borderRadius: 3,
            px: { xs: 1.5, sm: 2.5 },
            py: 0.8,
            fontWeight: 700,
            fontSize: { xs: "0.8rem", sm: "0.9rem" },
            border: "1px solid rgba(255, 255, 255, 0.3)",
            "&:hover": { bgcolor: "rgba(255, 255, 255, 0.35)" },
          }}
        >
          Back to Shopping
        </Button>
      </Box>

      <Container maxWidth="lg" sx={{ mt: { xs: -8, sm: -10, md: -12 }, position: "relative", zIndex: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 4 },
            mb: 3.5,
            borderRadius: 5,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: themeMode === "dark" ? "0 20px 50px rgba(0,0,0,0.5)" : "0 20px 50px rgba(108, 93, 211, 0.08)",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "center", sm: "flex-end" }}
            justifyContent="space-between"
            spacing={3}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "center", sm: "flex-end" }}
              spacing={3}
              sx={{ textAlign: { xs: "center", sm: "left" } }}
            >
              <Box sx={{ position: "relative", mt: { xs: -7, sm: -8 } }}>
                <Avatar
                  src={profile.profileImage?.url}
                  sx={{
                    width: { xs: 110, sm: 130 },
                    height: { xs: 110, sm: 130 },
                    fontSize: 48,
                    fontWeight: 800,
                    border: "5px solid",
                    borderColor: "background.paper",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
                    background: "linear-gradient(135deg, #6C5DD3 0%, #FF7551 100%)",
                  }}
                >
                  {profile.fullName ? profile.fullName[0].toUpperCase() : "U"}
                </Avatar>

                {avatarUploading && (
                  <CircularProgress
                    size={40}
                    sx={{ position: "absolute", top: "35%", left: "35%", color: "#FFFFFF" }}
                  />
                )}

                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="profile-avatar-input"
                  type="file"
                  onChange={handleAvatarChange}
                />
                <label htmlFor="profile-avatar-input">
                  <Tooltip title="Upload Avatar to Cloudinary">
                    <IconButton
                      component="span"
                      disabled={avatarUploading}
                      sx={{
                        position: "absolute",
                        bottom: 4,
                        right: 4,
                        bgcolor: "primary.main",
                        color: "#FFFFFF",
                        p: 0.9,
                        "&:hover": { bgcolor: "primary.dark" },
                      }}
                    >
                      <PhotoCamera sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </label>
              </Box>

              <Box sx={{ pb: { sm: 1 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, justifyContent: { xs: "center", sm: "flex-start" } }}>
                  <Typography variant="h5" fontWeight={800}>
                    {profile.fullName || authUser?.full_name || authUser?.name || authUser?.email || "LocalMart User"}
                  </Typography>
                  <Chip
                    icon={<VerifiedUserOutlined sx={{ fontSize: "16px !important" }} />}
                    label="Verified"
                    color="success"
                    size="small"
                    sx={{ fontWeight: 700, borderRadius: 2 }}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {profile.email} • LocalMart Customer Profile
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
              {!isEditing ? (
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                  sx={{ borderRadius: 3.5, px: 3, py: 1.2, fontWeight: 700 }}
                >
                  Edit Profile
                </Button>
              ) : (
                <Stack direction="row" spacing={1.5} width="100%">
                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    onClick={() => setIsEditing(false)}
                    sx={{ borderRadius: 3.5, px: 2, fontWeight: 700 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveProfile}
                    disabled={actionLoading}
                    sx={{ borderRadius: 3.5, px: 3, fontWeight: 700 }}
                  >
                    {actionLoading ? "Saving..." : "Save"}
                  </Button>
                </Stack>
              )}
            </Box>
          </Stack>
        </Paper>

        {successMsg && (
          <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3, borderRadius: 3.5 }}>
            {successMsg}
          </Alert>
        )}

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 3.5 }}>
            {errorMsg}
          </Alert>
        )}

        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 5, bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              mb: 3,
              borderBottom: "1px solid",
              borderColor: "divider",
              "& .MuiTab-root": { fontWeight: 700, fontSize: "0.95rem", textTransform: "none", minHeight: 48 },
            }}
          >
            <Tab label="Personal Info" icon={<PersonIcon />} iconPosition="start" />
            <Tab label="Saved Addresses" icon={<HomeIcon />} iconPosition="start" />
            <Tab label="Security & Account" icon={<SecurityOutlined />} iconPosition="start" />
          </Tabs>

          {activeTab === 0 && (
            <form onSubmit={handleSaveProfile}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Full Name"
                    fullWidth
                    disabled={!isEditing}
                    value={profile.fullName || ""}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    slotProps={{ input: { startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} /> } }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Email Address"
                    fullWidth
                    disabled
                    value={profile.email || ""}
                    slotProps={{ input: { startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} /> } }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Phone Number"
                    fullWidth
                    disabled={!isEditing}
                    value={profile.phone || ""}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    slotProps={{ input: { startAdornment: <PhoneIcon color="action" sx={{ mr: 1 }} /> } }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Account Role"
                    fullWidth
                    disabled
                    value="Verified Customer"
                    slotProps={{ input: { startAdornment: <BadgeOutlined color="action" sx={{ mr: 1 }} /> } }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Shopping Bio / Notes"
                    fullWidth
                    multiline
                    rows={2}
                    disabled={!isEditing}
                    value={profile.bio || ""}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell us your shopping preferences..."
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />
                </Grid>
              </Grid>
            </form>
          )}

          {activeTab === 1 && (
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight={800}>
                  My Delivery Addresses
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenAddressModal(null)}
                  sx={{ borderRadius: 3, fontWeight: 700 }}
                >
                  Add New Address
                </Button>
              </Stack>

              {profile.addresses.length === 0 ? (
                <Typography color="text.secondary" align="center" py={4}>
                  No delivery addresses saved yet. Click "Add New Address" to create one.
                </Typography>
              ) : (
                <Grid container spacing={2.5}>
                  {profile.addresses.map((addr) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={addr._id}>
                      <Card
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: 4,
                          border: "1px solid",
                          borderColor: addr.isDefault ? "primary.main" : "divider",
                          position: "relative",
                          bgcolor: addr.isDefault ? "rgba(108, 93, 211, 0.04)" : "background.paper",
                        }}
                      >
                        {addr.isDefault && (
                          <Chip
                            label="Default Address"
                            color="primary"
                            size="small"
                            sx={{ position: "absolute", top: 12, right: 12, fontWeight: 700 }}
                          />
                        )}

                        <Stack direction="row" spacing={1.5} alignItems="flex-start">
                          <LocationIcon color="primary" sx={{ mt: 0.3 }} />
                          <Box flex={1}>
                            <Typography fontWeight={700}>{addr.street}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {addr.city}, {addr.state} - {addr.postalCode}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {addr.country}
                            </Typography>

                            <Stack direction="row" spacing={1} mt={2}>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<EditIcon />}
                                onClick={() => handleOpenAddressModal(addr)}
                                sx={{ borderRadius: 2 }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => handleDeleteAddress(addr._id)}
                                sx={{ borderRadius: 2 }}
                              >
                                Delete
                              </Button>
                            </Stack>
                          </Box>
                        </Stack>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {activeTab === 2 && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Security Settings
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage your credentials and session protection
                </Typography>
              </Box>

              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography fontWeight={700}>Two-Factor Authentication</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Secured via Email OTP verification
                    </Typography>
                  </Box>
                  <Chip label="Enabled" color="success" size="small" sx={{ fontWeight: 700 }} />
                </Stack>
              </Paper>
            </Stack>
          )}
        </Paper>
      </Container>

      <Dialog open={addressModalOpen} onClose={() => setAddressModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={800}>
          {editingAddressId ? "Edit Address" : "Add New Address"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} pt={1}>
            <TextField
              label="Street Address / Flat"
              fullWidth
              value={addressForm.street}
              onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
            />
            <TextField
              label="City"
              fullWidth
              value={addressForm.city}
              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
            />
            <TextField
              label="State"
              fullWidth
              value={addressForm.state}
              onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
            />
            <TextField
              label="Postal Code"
              fullWidth
              value={addressForm.postalCode}
              onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                />
              }
              label="Set as Default Address"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setAddressModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveAddress} disabled={actionLoading}>
            {actionLoading ? "Saving..." : "Save Address"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
