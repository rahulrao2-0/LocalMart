import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../features/auth/authSlice";
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
  Divider,
  Alert,
  IconButton,
  Chip,
  Tabs,
  Tab,
  useTheme,
  Tooltip,
  Card,
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
  ShoppingBagOutlined,
  VerifiedUserOutlined,
  CancelOutlined,
  BadgeOutlined,
  LocalShippingOutlined,
  FavoriteBorderOutlined,
  SecurityOutlined,
  NotificationsNoneOutlined,
} from "@mui/icons-material";

export default function ProfilePage({ themeMode }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user) || {
    full_name: "Rahul Sharma",
    email: "rahul.sharma@gmail.com",
    phone: "+91 98765 43210",
    address: "Flat 302, Royal Palms, Vijay Nagar, Indore, MP - 452010",
    avatar: "",
  };

  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: user.full_name || user.username || "Rahul Sharma",
    email: user.email || user.gmail || "rahul.sharma@gmail.com",
    phone: user.phone || "+91 98765 43210",
    address: user.address || "Flat 302, Royal Palms, Vijay Nagar, Indore, MP - 452010",
    bio: user.bio || "Avid shopper exploring local stores near Vijay Nagar",
    avatar: user.avatar || "",
  });

  const [successMsg, setSuccessMsg] = useState("");

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileData({ ...profileData, avatar: imageUrl });
    }
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    dispatch(setUser({ ...user, ...profileData }));
    setIsEditing(false);
    setSuccessMsg("Profile details saved successfully!");
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        pb: 8,
        position: "relative",
      }}
    >
      {/* Hero Banner Header */}
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
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.35)",
            },
          }}
        >
          <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
            Back to Shopping
          </Box>
          <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
            Back
          </Box>
        </Button>
      </Box>

      {/* Main Profile Dashboard Container */}
      <Container maxWidth="lg" sx={{ mt: { xs: -8, sm: -10, md: -12 }, position: "relative", zIndex: 2 }}>
        {/* Profile Identity Card */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 4 },
            mb: 3.5,
            borderRadius: 5,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: themeMode === "dark"
              ? "0 20px 50px rgba(0,0,0,0.5)"
              : "0 20px 50px rgba(108, 93, 211, 0.08)",
            backdropFilter: "blur(20px)",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "center", sm: "flex-end" }}
            justifyContent="space-between"
            spacing={3}
          >
            {/* Avatar & Info */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "center", sm: "flex-end" }}
              spacing={3}
              sx={{ textAlign: { xs: "center", sm: "left" } }}
            >
              <Box sx={{ position: "relative", mt: { xs: -7, sm: -8 } }}>
                <Avatar
                  src={profileData.avatar}
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
                  {profileData.full_name ? profileData.full_name[0].toUpperCase() : "U"}
                </Avatar>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="profile-avatar-input"
                  type="file"
                  onChange={handleAvatarChange}
                />
                <label htmlFor="profile-avatar-input">
                  <Tooltip title="Update Profile Picture">
                    <IconButton
                      component="span"
                      sx={{
                        position: "absolute",
                        bottom: 4,
                        right: 4,
                        bgcolor: "primary.main",
                        color: "#FFFFFF",
                        boxShadow: "0 4px 14px rgba(108, 93, 211, 0.4)",
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
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 1.5,
                    justifyContent: { xs: "center", sm: "flex-start" },
                  }}
                >
                  <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: "1.35rem", sm: "1.65rem" } }}>
                    {profileData.full_name}
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
                  {profileData.email} • Joined LocalMart
                </Typography>
              </Box>
            </Stack>

            {/* Action Buttons */}
            <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
              {!isEditing ? (
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                  sx={{
                    borderRadius: 3.5,
                    px: 3,
                    py: 1.2,
                    fontWeight: 700,
                    boxShadow: "0 8px 20px rgba(108, 93, 211, 0.3)",
                  }}
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
                    onClick={handleSave}
                    sx={{ borderRadius: 3.5, px: 3, fontWeight: 700 }}
                  >
                    Save
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

        {/* Dashboard Quick Stats Bar */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 4,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                textAlign: "center",
              }}
            >
              <ShoppingBagOutlined color="primary" sx={{ fontSize: 28, mb: 0.5 }} />
              <Typography variant="h6" fontWeight={800}>
                14
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Total Orders
              </Typography>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 4,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                textAlign: "center",
              }}
            >
              <LocalShippingOutlined sx={{ color: "#FF7551", fontSize: 28, mb: 0.5 }} />
              <Typography variant="h6" fontWeight={800}>
                2
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Active Deliveries
              </Typography>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 4,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                textAlign: "center",
              }}
            >
              <FavoriteBorderOutlined sx={{ color: "#E91E63", fontSize: 28, mb: 0.5 }} />
              <Typography variant="h6" fontWeight={800}>
                8
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Favorite Shops
              </Typography>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 4,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                textAlign: "center",
              }}
            >
              <SecurityOutlined color="success" sx={{ fontSize: 28, mb: 0.5 }} />
              <Typography variant="h6" fontWeight={800}>
                Active
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Account Status
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Tabbed Content Section */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 4 },
            borderRadius: 5,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              mb: 3,
              borderBottom: "1px solid",
              borderColor: "divider",
              "& .MuiTab-root": {
                fontWeight: 700,
                fontSize: "0.95rem",
                textTransform: "none",
                minHeight: 48,
              },
            }}
          >
            <Tab label="Personal Info" icon={<PersonIcon />} iconPosition="start" />
            <Tab label="Delivery Address" icon={<HomeIcon />} iconPosition="start" />
            <Tab label="Security & Privacy" icon={<SecurityOutlined />} iconPosition="start" />
          </Tabs>

          {/* Tab 0: Personal Information */}
          {activeTab === 0 && (
            <form onSubmit={handleSave}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Full Name"
                    fullWidth
                    disabled={!isEditing}
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    slotProps={{
                      input: {
                        startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />,
                      },
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Email Address"
                    fullWidth
                    disabled
                    value={profileData.email}
                    slotProps={{
                      input: {
                        startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />,
                      },
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Phone Number"
                    fullWidth
                    disabled={!isEditing}
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    slotProps={{
                      input: {
                        startAdornment: <PhoneIcon color="action" sx={{ mr: 1 }} />,
                      },
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Account Type"
                    fullWidth
                    disabled
                    value="Verified Customer"
                    slotProps={{
                      input: {
                        startAdornment: <BadgeOutlined color="action" sx={{ mr: 1 }} />,
                      },
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Shopping Bio / Preferences"
                    fullWidth
                    multiline
                    rows={2}
                    disabled={!isEditing}
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />
                </Grid>
              </Grid>
            </form>
          )}

          {/* Tab 1: Delivery Address */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" fontWeight={800} gutterBottom>
                Default Delivery Address
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                This address is automatically pre-selected when ordering from local shops near you.
              </Typography>

              <TextField
                label="Full Address (Street, Flat, Area, Pincode)"
                fullWidth
                multiline
                rows={3}
                disabled={!isEditing}
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                slotProps={{
                  input: {
                    startAdornment: <HomeIcon color="action" sx={{ mr: 1, mt: 1 }} />,
                  },
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
              />
            </Box>
          )}

          {/* Tab 2: Security & Privacy */}
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

              <Paper
                elevation={0}
                sx={{ p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider" }}
              >
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

              <Paper
                elevation={0}
                sx={{ p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider" }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography fontWeight={700}>Session Refresh Token</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Stored in secure HTTP-Only cookie with DB revocation check
                    </Typography>
                  </Box>
                  <Chip label="Protected" color="primary" size="small" sx={{ fontWeight: 700 }} />
                </Stack>
              </Paper>
            </Stack>
          )}
        </Paper>
      </Container>
    </Box>
  );
}


