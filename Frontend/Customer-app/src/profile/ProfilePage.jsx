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
  Card,
  CardContent,
  useTheme,
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

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: user.full_name || user.username || "Rahul Sharma",
    email: user.email || user.gmail || "rahul.sharma@gmail.com",
    phone: user.phone || "+91 98765 43210",
    address: user.address || "Flat 302, Royal Palms, Vijay Nagar, Indore, MP - 452010",
    bio: user.bio || "Regular local shopper on LocalMart",
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
    e.preventDefault();
    dispatch(setUser({ ...user, ...profileData }));
    setIsEditing(false);
    setSuccessMsg("Profile updated successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4, px: { xs: 2, md: 4 } }}>
      <Container maxWidth="md">
        {/* Top Header */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <IconButton onClick={() => navigate("/")} sx={{ bgcolor: "background.paper", boxShadow: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight={800}>
              Customer Profile
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your personal information, address, and contact details
            </Typography>
          </Box>
        </Stack>

        {successMsg && (
          <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3, borderRadius: 3 }}>
            {successMsg}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Avatar & Card Sidebar */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                textAlign: "center",
                bgcolor: "background.paper",
              }}
            >
              <Box sx={{ position: "relative", display: "inline-block", mb: 2 }}>
                <Avatar
                  src={profileData.avatar}
                  sx={{
                    width: 110,
                    height: 110,
                    fontSize: 42,
                    fontWeight: 800,
                    bgcolor: "primary.main",
                    boxShadow: "0px 10px 25px rgba(108, 93, 211, 0.3)",
                  }}
                >
                  {profileData.full_name ? profileData.full_name[0].toUpperCase() : "U"}
                </Avatar>

                {/* Upload Photo Button */}
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="icon-button-file"
                  type="file"
                  onChange={handleAvatarChange}
                />
                <label htmlFor="icon-button-file">
                  <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="span"
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      bgcolor: "background.paper",
                      boxShadow: 2,
                      "&:hover": { bgcolor: "background.paper" },
                    }}
                  >
                    <PhotoCamera fontSize="small" />
                  </IconButton>
                </label>
              </Box>

              <Typography variant="h6" fontWeight={800}>
                {profileData.full_name}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                {profileData.email}
              </Typography>

              <Chip
                label="Verified Customer"
                color="success"
                size="small"
                sx={{ fontWeight: 700, borderRadius: 2 }}
              />
            </Paper>
          </Grid>

          {/* Details Form / View */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={800}>
                  Account Details
                </Typography>
                {!isEditing ? (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                    sx={{ borderRadius: 3, fontWeight: 700 }}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    sx={{ borderRadius: 3, fontWeight: 700 }}
                  >
                    Save Changes
                  </Button>
                )}
              </Stack>

              <Divider sx={{ mb: 3 }} />

              <form onSubmit={handleSave}>
                <Stack spacing={3}>
                  <TextField
                    label="Full Name"
                    fullWidth
                    disabled={!isEditing}
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    InputProps={{
                      startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />,
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />

                  <TextField
                    label="Email Address"
                    fullWidth
                    disabled
                    value={profileData.email}
                    InputProps={{
                      startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />,
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />

                  <TextField
                    label="Phone Number"
                    fullWidth
                    disabled={!isEditing}
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    InputProps={{
                      startAdornment: <PhoneIcon color="action" sx={{ mr: 1 }} />,
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />

                  <TextField
                    label="Delivery Address"
                    fullWidth
                    multiline
                    rows={3}
                    disabled={!isEditing}
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    InputProps={{
                      startAdornment: <HomeIcon color="action" sx={{ mr: 1, alignSelf: "flex-start", mt: 1 }} />,
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />

                  <TextField
                    label="About / Notes"
                    fullWidth
                    multiline
                    rows={2}
                    disabled={!isEditing}
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />
                </Stack>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
