import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";
import {
  AppBar,
  Toolbar,
  Box,
  Stack,
  Typography,
  Button,
  IconButton,
  Badge,
  ToggleButton,
  ToggleButtonGroup,
  Menu,
  MenuItem,
  useTheme,
  Tooltip,
  Avatar,
  Divider,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import {
  LocationOn as LocationOnIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  LocalShipping as LocalShippingIcon,
  Storefront as StorefrontIcon,
  ShoppingCartOutlined as ShoppingCartOutlinedIcon,
  PersonOutlined as PersonOutlineIcon,
  DarkModeOutlined as DarkModeOutlinedIcon,
  LightModeOutlined as LightModeOutlinedIcon,
  Store as StoreIcon,
  HelpOutlineOutlined as HelpIcon,
  ShoppingBagOutlined as OrdersIcon,
  LogoutOutlined as LogoutIcon,
  AccountCircleOutlined as AccountCircleIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import NotificationBell from "../components/NotificationBell";

export default function Navbar({
  location = "Vijay Nagar, Indore",
  mode = "delivery",
  onModeChange,
  cartCount = 0,
  onCartToggle,
  themeMode = "light",
  onToggleTheme,
  onLocationChange,
  onLogout,
  onNavigate,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [userAnchorEl, setUserAnchorEl] = useState(null);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [ordersDialogOpen, setOrdersDialogOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get logged-in user from Redux store
  const user = useSelector((state) => state.auth.user);
  const isSeller = user?.role === 'seller' || user?.isSeller === true;

  const handleModeChange = (event, newMode) => {
    if (newMode !== null && onModeChange) onModeChange(newMode);
  };

  const handleLocationClick = (loc) => {
    if (onLocationChange) onLocationChange(loc);
    setAnchorEl(null);
  };

  const handleUserMenuClick = (event) => {
    setUserAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleUserMenuClose();
    dispatch(logout());
    if (onLogout) onLogout();
  };

  const getUserDisplayName = () => {
    if (!user) return "";
    return user.fullName || user.full_name || user.username || user.name || user.email || "Account";
  };

  const getUserEmail = () => {
    if (!user) return "";
    return user.email || user.gmail || "";
  };

  const getUserInitial = () => {
    const name = getUserDisplayName();
    return name ? name[0].toUpperCase() : "A";
  };

  const getDisplayLocation = () => {
    if (user) {
      if (user.address) return user.address;
      if (user.location) return user.location;
      if (user.addresses && user.addresses.length > 0) return user.addresses[0].street || user.addresses[0].city || "Address Added";
      return "📍 Please Add Address";
    }
    return location;
  };

  return (
    <>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          backdropFilter: "blur(20px)",
          backgroundColor: themeMode === "dark" ? "rgba(22, 25, 37, 0.85)" : "rgba(255, 255, 255, 0.85)",
          borderBottom: "1px solid",
          borderColor: "divider",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", py: 1, px: { xs: 1.5, md: 3 }, gap: { xs: 1, md: 2 } }}>
          {/* LOGO */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              onClick={() => navigate("/")}
              sx={{
                width: 38,
                height: 38,
                borderRadius: "10px",
                background: "linear-gradient(135deg, #6C5DD3 0%, #FF7551 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0px 4px 10px rgba(108, 93, 211, 0.25)",
                cursor: "pointer",
              }}
            >
              <StoreIcon sx={{ color: "#FFFFFF", fontSize: 20 }} />
            </Box>
            <Typography
              variant="h6"
              fontWeight={800}
              onClick={() => navigate("/")}
              sx={{
                background: "linear-gradient(135deg, #6C5DD3 0%, #FF7551 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.5px",
                cursor: "pointer",
                display: { xs: "none", sm: "block" },
              }}
            >
              LocalMart
            </Typography>
          </Box>

          {/* LOCATION SELECTOR */}
          <Button
            onClick={(e) => setAnchorEl(e.currentTarget)}
            startIcon={<LocationOnIcon sx={{ color: "primary.main" }} />}
            endIcon={<KeyboardArrowDownIcon fontSize="small" sx={{ color: "text.secondary" }} />}
            color="inherit"
            sx={{
              textTransform: "none",
              borderRadius: 3,
              px: 1.5,
              py: 0.5,
              backgroundColor: themeMode === "dark" ? "rgba(255, 255, 255, 0.04)" : "rgba(108, 93, 211, 0.04)",
              "&:hover": {
                backgroundColor: themeMode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(108, 93, 211, 0.08)",
              },
              maxWidth: { xs: 130, sm: 200 },
            }}
          >
            <Box sx={{ textAlign: "left", overflow: "hidden" }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1 }}>
                Deliver to
              </Typography>
              <Typography variant="body2" fontWeight={700} noWrap sx={{ color: "text.primary" }}>
                {getDisplayLocation()}
              </Typography>
            </Box>
          </Button>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            {!user ? (
              <MenuItem onClick={() => { setAnchorEl(null); navigate("/login"); }} sx={{ color: "primary.main", fontWeight: 700 }}>
                Login to view addresses
              </MenuItem>
            ) : (
              <>
                {user.addresses && user.addresses.length > 0 ? (
                  user.addresses.map((addr, index) => (
                    <MenuItem key={index} onClick={() => handleLocationClick(`${addr.street}, ${addr.city}`)}>
                      {addr.street}, {addr.city}
                    </MenuItem>
                  ))
                ) : (user.address || user.location) ? (
                  <MenuItem onClick={() => handleLocationClick(user.address || user.location)}>
                    {user.address || user.location}
                  </MenuItem>
                ) : (
                  <MenuItem onClick={() => { setAnchorEl(null); navigate("/profile"); }} sx={{ color: "primary.main", fontWeight: 700 }}>
                    + Add New Address
                  </MenuItem>
                )}
                
                {(user.addresses?.length > 0 || user.address || user.location) && (
                  <MenuItem onClick={() => { setAnchorEl(null); navigate("/profile"); }} sx={{ color: "primary.main", fontWeight: 700, borderTop: "1px solid #eee" }}>
                    + Add Another Address
                  </MenuItem>
                )}
              </>
            )}
          </Menu>

          {/* DELIVERY / PICKUP TOGGLE */}
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleModeChange}
            size="small"
            color="primary"
            sx={{ display: { xs: "none", md: "inline-flex" } }}
          >
            <ToggleButton value="delivery" sx={{ textTransform: "none", px: 2 }}>
              <LocalShippingIcon fontSize="small" sx={{ mr: 0.75 }} />
              Home Delivery
            </ToggleButton>
            <ToggleButton value="pickup" sx={{ textTransform: "none", px: 2 }}>
              <StorefrontIcon fontSize="small" sx={{ mr: 0.75 }} />
              Store Pickup
            </ToggleButton>
          </ToggleButtonGroup>

          {/* ACTIONS */}
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, md: 1 } }}>
            {/* SELL BUTTON */}
            {!isSeller && (
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<StoreIcon />}
                onClick={() => { window.open('http://localhost:5174/signup', '_blank'); }}
                sx={{
                  display: { xs: "none", sm: "inline-flex" },
                  borderRadius: "10px",
                  fontWeight: 700,
                  borderWidth: "1.5px",
                }}
              >
                Sell
              </Button>
            )}

            {/* THEME TOGGLE */}
            <Tooltip title={themeMode === "dark" ? "Light Mode" : "Dark Mode"}>
              <IconButton onClick={onToggleTheme} sx={{ color: "text.secondary" }}>
                {themeMode === "dark" ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
              </IconButton>
            </Tooltip>

            {/* USER PROFILE / AUTH BUTTONS */}
            {user ? (
              <>
                {/* Account Button (Desktop & Mobile) */}
                <Button
                  onClick={handleUserMenuClick}
                  endIcon={<KeyboardArrowDownIcon />}
                  sx={{
                    borderRadius: 3,
                    px: { xs: 1, sm: 1.5 },
                    py: 0.5,
                    textTransform: "none",
                    backgroundColor: themeMode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(108, 93, 211, 0.06)",
                    "&:hover": {
                      backgroundColor: themeMode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(108, 93, 211, 0.12)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: "primary.main",
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#FFFFFF",
                      }}
                    >
                      {getUserInitial()}
                    </Avatar>
                    <Box sx={{ textAlign: "left", display: { xs: "none", sm: "block" } }}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1 }}>
                        Account
                      </Typography>
                      <Typography variant="body2" fontWeight={700} noWrap sx={{ color: "text.primary", maxWidth: 100 }}>
                        {getUserDisplayName()}
                      </Typography>
                    </Box>
                  </Box>
                </Button>

                {/* Account Dropdown Menu with requested 4 buttons */}
                <Menu
                  anchorEl={userAnchorEl}
                  open={Boolean(userAnchorEl)}
                  onClose={handleUserMenuClose}
                  PaperProps={{
                    sx: {
                      borderRadius: 3,
                      mt: 1,
                      minWidth: 220,
                      boxShadow: "0px 10px 30px rgba(0,0,0,0.15)",
                      p: 0.5,
                    },
                  }}
                >
                  {/* Account Header */}
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                      {getUserDisplayName()}
                    </Typography>
                    {getUserEmail() && (
                      <Typography variant="caption" color="text.secondary" display="block" noWrap>
                        {getUserEmail()}
                      </Typography>
                    )}
                  </Box>
                  <Divider sx={{ my: 0.5 }} />

                  {/* 1. Profile */}
                  <MenuItem onClick={() => { handleUserMenuClose(); navigate("/profile"); }}>
                    <ListItemIcon>
                      <AccountCircleIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <Typography variant="body2" fontWeight={600}>Profile</Typography>
                  </MenuItem>

                  {/* 2. My Orders */}
                  <MenuItem onClick={() => { handleUserMenuClose(); navigate("/orders"); }}>
                    <ListItemIcon>
                      <OrdersIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <Typography variant="body2" fontWeight={600}>My Orders</Typography>
                  </MenuItem>

                  {/* 3. Help */}
                  <MenuItem onClick={() => { handleUserMenuClose(); setHelpDialogOpen(true); }}>
                    <ListItemIcon>
                      <HelpIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <Typography variant="body2" fontWeight={600}>Help & Support</Typography>
                  </MenuItem>

                  {isSeller && (
                    <MenuItem onClick={() => { handleUserMenuClose(); window.open('http://localhost:5174', '_blank'); }}>
                      <ListItemIcon>
                        <StoreIcon fontSize="small" color="primary" />
                      </ListItemIcon>
                      <Typography variant="body2" fontWeight={600}>Seller Dashboard</Typography>
                    </MenuItem>
                  )}

                  <Divider sx={{ my: 0.5 }} />

                  {/* 4. Logout */}
                  <MenuItem onClick={handleLogoutClick} sx={{ color: "error.main" }}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <Typography variant="body2" fontWeight={700}>Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              /* Hide Login/Signup if user logged in, render only when logged out */
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Button
                  variant="text"
                  color="primary"
                  size="small"
                  onClick={() => navigate("/login")}
                  sx={{
                    fontWeight: 700,
                    borderRadius: "10px",
                    px: 1.5,
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => navigate("/signup")}
                  sx={{
                    fontWeight: 700,
                    borderRadius: "10px",
                    px: 2,
                    display: { xs: "none", sm: "inline-flex" },
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            )}

            {user && <NotificationBell />}

            {/* CART BUTTON (Navigates to Dedicated /cart page) */}
            <Tooltip title="View Cart">
              <IconButton onClick={() => navigate("/cart")} sx={{ color: "text.primary" }}>
                <Badge badgeContent={cartCount} color="primary">
                  <ShoppingCartOutlinedIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Dialog */}
      <Dialog open={profileDialogOpen} onClose={() => setProfileDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          User Profile
          <IconButton onClick={() => setProfileDialogOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Avatar sx={{ width: 64, height: 64, mx: "auto", mb: 2, bgcolor: "primary.main", fontSize: 28, fontWeight: 700 }}>
              {getUserInitial()}
            </Avatar>
            <Typography variant="h6" fontWeight={700}>{getUserDisplayName()}</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>{getUserEmail()}</Typography>
            <Box sx={{ mt: 3, p: 2, borderRadius: 3, bgcolor: "background.default", textAlign: "left" }}>
              <Typography variant="caption" color="text.secondary" display="block">Account Type</Typography>
              <Typography variant="body2" fontWeight={600} gutterBottom>Customer</Typography>
              <Typography variant="caption" color="text.secondary" display="block">Delivery Location</Typography>
              <Typography variant="body2" fontWeight={600}>{location}</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileDialogOpen(false)} variant="contained" sx={{ borderRadius: 3 }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={helpDialogOpen} onClose={() => setHelpDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Help & Support
          <IconButton onClick={() => setHelpDialogOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" paragraph>
            Need help with your local orders or delivery? We are here to assist you 24/7.
          </Typography>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box sx={{ p: 2, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
              <Typography variant="subtitle2" fontWeight={700}>📞 Customer Helpline</Typography>
              <Typography variant="body2" color="text.secondary">+91 1800-LOCAL-MART</Typography>
            </Box>
            <Box sx={{ p: 2, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
              <Typography variant="subtitle2" fontWeight={700}>✉️ Email Support</Typography>
              <Typography variant="body2" color="text.secondary">support@localmart.in</Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpDialogOpen(false)} variant="contained" sx={{ borderRadius: 3 }}>Done</Button>
        </DialogActions>
      </Dialog>

      {/* My Orders Dialog */}
      <Dialog open={ordersDialogOpen} onClose={() => setOrdersDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          My Orders
          <IconButton onClick={() => setOrdersDialogOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ textAlign: "center", py: 3 }}>
            <OrdersIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1, opacity: 0.5 }} />
            <Typography variant="h6" fontWeight={700} gutterBottom>No Active Orders</Typography>
            <Typography variant="body2" color="text.secondary">
              When you place an order from local shops near you, your live tracking and order history will appear here.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrdersDialogOpen(false)} variant="contained" sx={{ borderRadius: 3 }}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
