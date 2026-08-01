import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Chip,
  Avatar,
  Switch,
  FormControlLabel,
  Paper,
  Container,
} from "@mui/material";
import { Storefront as StorefrontIcon, Done as DoneIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function SellerSignupPage({ themeMode }) {
  const navigate = useNavigate();
  const [regStep, setRegStep] = useState(1);
  const [shopRegData, setShopRegData] = useState({
    shopName: "",
    ownerName: "",
    category: "Grocery",
    phone: "",
    address: "",
    deliveryRadius: 3,
    supportsPickup: true,
  });

  const handleShopRegSubmit = (e) => {
    e.preventDefault();
    if (regStep < 3) {
      setRegStep(regStep + 1);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pt: 8, pb: 8 }}>
      <Container maxWidth="sm">
        <Paper
          elevation={themeMode === "dark" ? 0 : 3}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            bgcolor: "background.paper",
            border: themeMode === "dark" ? "1px solid" : "none",
            borderColor: "divider",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4, justifyContent: "center" }}>
            <StorefrontIcon color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h4" fontWeight={800}>
              Register Your Shop
            </Typography>
          </Box>

          <form onSubmit={handleShopRegSubmit}>
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 4 }}>
              <Chip label="1. Basic Info" color={regStep >= 1 ? "primary" : "default"} sx={{ fontWeight: 700 }} />
              <Chip label="2. Delivery" color={regStep >= 2 ? "primary" : "default"} sx={{ fontWeight: 700 }} />
              <Chip label="3. Complete" color={regStep >= 3 ? "primary" : "default"} sx={{ fontWeight: 700 }} />
            </Stack>

            {regStep === 1 && (
              <Stack spacing={3}>
                <TextField
                  label="Shop Name"
                  fullWidth
                  required
                  value={shopRegData.shopName}
                  onChange={(e) => setShopRegData({ ...shopRegData, shopName: e.target.value })}
                />
                <TextField
                  label="Owner Name"
                  fullWidth
                  required
                  value={shopRegData.ownerName}
                  onChange={(e) => setShopRegData({ ...shopRegData, ownerName: e.target.value })}
                />
                <TextField
                  label="Primary Contact Number"
                  fullWidth
                  required
                  type="tel"
                  value={shopRegData.phone}
                  onChange={(e) => setShopRegData({ ...shopRegData, phone: e.target.value })}
                />
              </Stack>
            )}

            {regStep === 2 && (
              <Stack spacing={3}>
                <TextField
                  label="Shop Address"
                  fullWidth
                  required
                  multiline
                  rows={3}
                  value={shopRegData.address}
                  onChange={(e) => setShopRegData({ ...shopRegData, address: e.target.value })}
                />
                <TextField
                  label="Delivery Radius Capacity (km)"
                  fullWidth
                  required
                  type="number"
                  value={shopRegData.deliveryRadius}
                  onChange={(e) => setShopRegData({ ...shopRegData, deliveryRadius: Number(e.target.value) })}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={shopRegData.supportsPickup}
                      onChange={(e) => setShopRegData({ ...shopRegData, supportsPickup: e.target.checked })}
                    />
                  }
                  label="Supports In-store Pickup"
                />
              </Stack>
            )}

            {regStep === 3 && (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Avatar sx={{ bgcolor: "success.main", width: 80, height: 80, mx: "auto", mb: 3 }}>
                  <DoneIcon sx={{ fontSize: 48, color: "#FFFFFF" }} />
                </Avatar>
                <Typography variant="h5" fontWeight={800} gutterBottom>
                  Application Submitted!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Our team will verify your local shop details and contact you at{" "}
                  <strong>{shopRegData.phone}</strong> within 24 hours to go live!
                </Typography>
              </Box>
            )}

            <Box sx={{ display: "flex", gap: 2, mt: 5 }}>
              {regStep < 3 ? (
                <>
                  {regStep > 1 && (
                    <Button variant="outlined" onClick={() => setRegStep(regStep - 1)} fullWidth size="large" sx={{ borderRadius: 2 }}>
                      Back
                    </Button>
                  )}
                  <Button type="submit" variant="contained" fullWidth size="large" sx={{ borderRadius: 2 }}>
                    Next Step
                  </Button>
                </>
              ) : (
                <Button variant="contained" onClick={() => navigate("/")} fullWidth size="large" sx={{ borderRadius: 2 }}>
                  Return to Home
                </Button>
              )}
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
