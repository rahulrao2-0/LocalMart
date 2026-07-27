import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
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
} from "@mui/icons-material";

export default function Navbar({
  location = "Vijay Nagar, Indore",
  mode = "delivery",
  onModeChange,
  cartCount = 0,
  onCartToggle,
  themeMode = "light",
  onToggleTheme,
  onOpenShopReg,
  onLocationChange,
  currentUser,
  onLogout,
  onNavigate,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [userAnchorEl, setUserAnchorEl] = useState(null);
  const theme = useTheme();

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
    if (onLogout) onLogout();
  };

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        backdropFilter: "blur(20px)",
        backgroundColor: themeMode === "dark" ? "rgba(22, 25, 37, 0.75)" : "rgba(255, 255, 255, 0.8)",
        borderBottom: "1px solid",
        borderColor: "divider",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", py: 1, px: { xs: 1.5, md: 3 }, gap: { xs: 1, md: 2 } }}>
        {/* LOGO */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #6C5DD3 0%, #FF7551 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0px 4px 10px rgba(108, 93, 211, 0.25)",
            }}
          >
            <StoreIcon sx={{ color: "#FFFFFF", fontSize: 20 }} />
          </Box>
          <Typography
            variant="h6"
            fontWeight={800}
            sx={{
              background: "linear-gradient(135deg, #6C5DD3 0%, #FF7551 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.5px",
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
            maxWidth: { xs: 140, sm: 200 },
          }}
        >
          <Box sx={{ textAlign: "left", overflow: "hidden" }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1 }}>
              Deliver to
            </Typography>
            <Typography variant="body2" fontWeight={700} noWrap sx={{ color: "text.primary" }}>
              {location}
            </Typography>
          </Box>
        </Button>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => handleLocationClick("Vijay Nagar, Indore")}>Vijay Nagar, Indore</MenuItem>
          <MenuItem onClick={() => handleLocationClick("Palasia, Indore")}>Palasia, Indore</MenuItem>
          <MenuItem onClick={() => handleLocationClick("Rajwada, Indore")}>Rajwada, Indore</MenuItem>
          <MenuItem onClick={() => handleLocationClick("Bhawarkua, Indore")}>Bhawarkua, Indore</MenuItem>
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
          <ToggleButton value="delivery" sx={{ textTransform: "none", px: 2.5 }}>
            <LocalShippingIcon fontSize="small" sx={{ mr: 0.75 }} />
            Home Delivery
          </ToggleButton>
          <ToggleButton value="pickup" sx={{ textTransform: "none", px: 2.5 }}>
            <StorefrontIcon fontSize="small" sx={{ mr: 0.75 }} />
            Store Pickup
          </ToggleButton>
        </ToggleButtonGroup>

        {/* ACTIONS */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, md: 1 } }}>
          {/* SELL BUTTON */}
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<StoreIcon />}
            onClick={onOpenShopReg}
            sx={{
              display: { xs: "none", sm: "inline-flex" },
              borderRadius: "10px",
              fontWeight: 700,
              borderWidth: "1.5px",
            }}
          >
            Sell
          </Button>

          {/* THEME TOGGLE */}
          <Tooltip title={themeMode === "dark" ? "Light Mode" : "Dark Mode"}>
            <IconButton onClick={onToggleTheme} sx={{ color: "text.secondary" }}>
              {themeMode === "dark" ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>
          </Tooltip>

          {/* USER PROFILE & AUTHENTICATION */}
          {currentUser ? (
            <>
              <Tooltip title={currentUser.username}>
                <Box
                  onClick={handleUserMenuClick}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    cursor: "pointer",
                    p: 0.5,
                    px: 1,
                    borderRadius: 3,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: themeMode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(108, 93, 211, 0.05)",
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: "primary.main",
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#FFFFFF",
                      border: "2px solid",
                      borderColor: "secondary.main",
                    }}
                  >
                    {currentUser.username[0].toUpperCase()}
                  </Avatar>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    sx={{
                      display: { xs: "none", md: "block" },
                      color: "text.primary",
                    }}
                  >
                    {currentUser.username}
                  </Typography>
                </Box>
              </Tooltip>
              <Menu
                anchorEl={userAnchorEl}
                open={Boolean(userAnchorEl)}
                onClose={handleUserMenuClose}
                PaperProps={{
                  sx: { borderRadius: 3, mt: 1, minWidth: 150 },
                }}
              >
                <MenuItem disabled>
                  <Typography variant="caption" color="text.secondary">
                    Logged in as: <strong>{currentUser.gmail || "Google User"}</strong>
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleUserMenuClose}>My Orders</MenuItem>
                <MenuItem onClick={handleUserMenuClose}>Shop Dashboard</MenuItem>
                <Divider />
                <MenuItem onClick={handleLogoutClick} sx={{ color: "error.main", fontWeight: 600 }}>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                variant="text"
                color="primary"
                size="small"
                onClick={() => onNavigate("login")}
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
                onClick={() => onNavigate("signup")}
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

          {/* SHOPPING CART */}
          <IconButton
            onClick={onCartToggle}
            sx={{
              backgroundColor: "primary.main",
              color: "#FFFFFF",
              "&:hover": {
                backgroundColor: "primary.dark",
                transform: "scale(1.05)",
              },
              boxShadow: "0px 4px 10px rgba(108, 93, 211, 0.2)",
              width: 40,
              height: 40,
              transition: "all 0.2s ease",
            }}
          >
            <Badge badgeContent={cartCount} color="secondary" overlap="circular">
              <ShoppingCartOutlinedIcon fontSize="small" />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}