import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  IconButton,
  Stack,
  Divider,
  Alert,
  Avatar,
  Chip,
  Card,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  useTheme,
  Dialog,
  Tooltip,
} from "@mui/material";
import {
  ShoppingCart as ShoppingCartIcon,
  DeleteOutlined as DeleteOutlineIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ArrowBack as ArrowBackIcon,
  LocalShippingOutlined as LocalShippingIcon,
  StorefrontOutlined as StorefrontIcon,
  CheckCircle as CheckCircleIcon,
  ShoppingBagOutlined as ShoppingBagIcon,
  LocalOfferOutlined as LocalOfferIcon,
  ShieldOutlined,
  VerifiedUserOutlined,
  AccessTime,
  StoreOutlined,
  PaymentsOutlined,
} from "@mui/icons-material";

export default function CartPage({ cart = [], onUpdateQuantity, onRemoveFromCart, onClearCart, themeMode }) {
  const theme = useTheme();
  const navigate = useNavigate();

  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoSuccess, setPromoSuccess] = useState("");
  const [promoError, setPromoError] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  // Calculate Subtotal & Fees
  const subtotal = cart.reduce((acc, item) => acc + (item.shop?.price || 0) * item.quantity, 0);
  const deliveryFee = deliveryMethod === "delivery" ? (subtotal > 0 ? 30 : 0) : 0;
  const packagingFee = subtotal > 0 ? 15 : 0;
  const totalPayable = Math.max(0, subtotal + deliveryFee + packagingFee - discount);

  const handleApplyPromo = () => {
    setPromoError("");
    setPromoSuccess("");
    const code = promoCode.trim().toUpperCase();
    if (code === "LOCAL10") {
      const discAmount = Math.round(subtotal * 0.1);
      setDiscount(discAmount);
      setPromoSuccess(`🎉 Code LOCAL10 applied! Saved ₹${discAmount} (10% OFF)`);
    } else if (code === "FREESHIP") {
      setDiscount(deliveryFee);
      setPromoSuccess("🚚 Free Delivery promo applied!");
    } else if (code === "WELCOME50") {
      const discAmount = Math.min(50, subtotal);
      setDiscount(discAmount);
      setPromoSuccess(`🎁 Welcome offer applied! Saved ₹${discAmount}`);
    } else {
      setPromoError("Invalid promo code. Try 'LOCAL10' or 'FREESHIP'");
    }
  };

  const handlePlaceOrder = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setOrderDetails({
        orderId: `LM-${Math.floor(100000 + Math.random() * 900000)}`,
        items: cart,
        subtotal,
        deliveryFee,
        packagingFee,
        discount,
        totalPayable,
        deliveryMethod,
        date: new Date().toLocaleDateString(),
      });
      setOrderComplete(true);
      if (onClearCart) onClearCart();
    }, 1200);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: { xs: 2.5, sm: 4, md: 5 },
        px: { xs: 1.5, sm: 3, md: 4 },
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Dynamic Background Glow Accents */}
      <Box
        sx={{
          position: "absolute",
          top: "-5%",
          left: "-5%",
          width: { xs: "250px", md: "450px" },
          height: { xs: "250px", md: "450px" },
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(108, 93, 211, 0.12) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-10%",
          right: "-5%",
          width: { xs: "300px", md: "500px" },
          height: { xs: "300px", md: "500px" },
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255, 117, 81, 0.1) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        {/* Header Navigation */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: { xs: 3, md: 4 } }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, sm: 2 } }}>
            <Button
              onClick={() => navigate("/")}
              startIcon={<ArrowBackIcon fontSize="small" />}
              size="small"
              sx={{
                minWidth: { xs: 38, sm: "auto" },
                px: { xs: 1.2, sm: 2.2 },
                py: { xs: 0.8, sm: 1 },
                borderRadius: 3,
                fontWeight: 700,
                fontSize: { xs: "0.825rem", sm: "0.9rem" },
                color: "text.primary",
                backgroundColor: themeMode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.9)",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: themeMode === "dark" ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.05)",
                "&:hover": {
                  backgroundColor: themeMode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(108, 93, 211, 0.08)",
                  borderColor: "primary.main",
                },
                "& .MuiButton-startIcon": {
                  mr: { xs: 0.5, sm: 1 },
                },
              }}
            >
              <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                Back to Stores
              </Box>
            </Button>

            <Box>
              <Typography
                variant="h5"
                fontWeight={800}
                sx={{
                  fontSize: { xs: "1.25rem", sm: "1.65rem", md: "1.9rem" },
                  letterSpacing: "-0.5px",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                Shopping Cart
                {cart.length > 0 && (
                  <Chip
                    label={`${cart.reduce((a, b) => a + b.quantity, 0)} Items`}
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 800, borderRadius: 2 }}
                  />
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", sm: "block" }, mt: 0.3 }}>
                Review items, choose delivery method, and place order from local shops
              </Typography>
            </Box>
          </Box>

          {cart.length > 0 && (
            <Button
              variant="text"
              color="error"
              size="small"
              onClick={onClearCart}
              startIcon={<DeleteOutlineIcon />}
              sx={{ fontWeight: 700, borderRadius: 2.5, display: { xs: "none", sm: "flex" } }}
            >
              Clear Cart
            </Button>
          )}
        </Stack>

        {cart.length === 0 ? (
          /* Empty Cart State */
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, sm: 7 },
              textAlign: "center",
              borderRadius: 5,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              boxShadow: themeMode === "dark" ? "0 10px 40px rgba(0,0,0,0.4)" : "0 10px 40px rgba(108,93,211,0.06)",
            }}
          >
            <Avatar
              sx={{
                width: 90,
                height: 90,
                mx: "auto",
                mb: 2.5,
                background: "linear-gradient(135deg, rgba(108, 93, 211, 0.2) 0%, rgba(255, 117, 81, 0.2) 100%)",
                color: "primary.main",
              }}
            >
              <ShoppingCartIcon sx={{ fontSize: 46 }} />
            </Avatar>
            <Typography variant="h5" fontWeight={800} gutterBottom>
              Your Cart is Empty
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5, maxWidth: 450, mx: "auto" }}>
              Looks like you haven't added any products from local stores yet. Browse products from shops in your neighborhood!
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate("/")}
              sx={{
                borderRadius: 3.5,
                px: 4,
                py: 1.3,
                fontWeight: 800,
                fontSize: "1rem",
                boxShadow: "0 8px 25px rgba(108, 93, 211, 0.35)",
              }}
            >
              Explore Nearby Shops
            </Button>
          </Paper>
        ) : (
          /* Cart Grid Layout */
          <Grid container spacing={{ xs: 2.5, md: 3.5 }}>
            {/* Left Column: Cart Items */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={2.5}>
                {cart.map((item, index) => (
                  <Card
                    key={`${item.product.id}-${item.shop.shopName}-${index}`}
                    elevation={0}
                    sx={{
                      p: { xs: 2, sm: 2.8 },
                      borderRadius: 4.5,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                      boxShadow: themeMode === "dark"
                        ? "0 8px 24px rgba(0,0,0,0.3)"
                        : "0 8px 24px rgba(108, 93, 211, 0.04)",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        borderColor: "primary.main",
                        boxShadow: "0 10px 30px rgba(108, 93, 211, 0.12)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "flex-start", sm: "center" },
                        justifyContent: "space-between",
                        gap: 2,
                      }}
                    >
                      {/* Product & Store Info */}
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 1 }}>
                          <Chip
                            icon={<StoreOutlined sx={{ fontSize: "15px !important" }} />}
                            label={item.shop.shopName}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 700, borderRadius: 2 }}
                          />
                          <Chip
                            icon={<AccessTime sx={{ fontSize: "14px !important" }} />}
                            label={`${item.shop.distanceKm || 0.8} km away (~20 mins)`}
                            size="small"
                            sx={{ fontSize: "0.75rem", fontWeight: 600 }}
                          />
                        </Box>

                        <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: "1.05rem", sm: "1.2rem" } }}>
                          {item.product.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.3 }}>
                          Category: <strong>{item.product.category || "General"}</strong> • Brand: {item.product.brand || "Local Quality"}
                        </Typography>

                        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 1 }}>
                          <Typography variant="subtitle1" fontWeight={800} color="primary.main">
                            ₹{item.shop.price}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            per unit
                          </Typography>
                        </Box>
                      </Box>

                      {/* Controls: Quantity & Item Subtotal */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: { xs: "100%", sm: "auto" },
                          gap: { xs: 1.5, sm: 3 },
                          pt: { xs: 1, sm: 0 },
                          borderTop: { xs: "1px solid", sm: "none" },
                          borderColor: "divider",
                        }}
                      >
                        {/* Quantity Counter */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            bgcolor: themeMode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(108, 93, 211, 0.06)",
                            borderRadius: 3,
                            p: 0.5,
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => onUpdateQuantity(index, -1)}
                            sx={{ color: "text.primary" }}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography variant="body1" fontWeight={800} sx={{ px: 1.5, minWidth: 24, textAlign: "center" }}>
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => onUpdateQuantity(index, 1)}
                            sx={{ color: "primary.main" }}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>

                        <Box sx={{ textAlign: "right" }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                            Item Total
                          </Typography>
                          <Typography variant="h6" fontWeight={800}>
                            ₹{item.shop.price * item.quantity}
                          </Typography>
                        </Box>

                        <Tooltip title="Remove item">
                          <IconButton
                            color="error"
                            onClick={() => onRemoveFromCart(index)}
                            sx={{
                              bgcolor: "rgba(255, 77, 77, 0.08)",
                              "&:hover": { bgcolor: "rgba(255, 77, 77, 0.18)" },
                            }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Card>
                ))}
              </Stack>
            </Grid>

            {/* Right Column: Fulfillment & Payment Summary */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: 5,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  boxShadow: themeMode === "dark"
                    ? "0 10px 35px rgba(0,0,0,0.4)"
                    : "0 10px 35px rgba(108, 93, 211, 0.06)",
                  position: "sticky",
                  top: 24,
                }}
              >
                {/* Fulfillment Selection */}
                <Typography variant="subtitle1" fontWeight={800} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LocalShippingIcon color="primary" fontSize="small" /> Delivery Preference
                </Typography>

                <RadioGroup value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value)} sx={{ mb: 3 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      mb: 1.5,
                      borderRadius: 3.5,
                      borderColor: deliveryMethod === "delivery" ? "primary.main" : "divider",
                      bgcolor: deliveryMethod === "delivery" ? (themeMode === "dark" ? "rgba(108, 93, 211, 0.1)" : "rgba(108, 93, 211, 0.04)") : "transparent",
                    }}
                  >
                    <FormControlLabel
                      value="delivery"
                      control={<Radio size="small" />}
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight={700}>
                            Home Delivery (₹30)
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Delivered to your doorstep in ~30 mins
                          </Typography>
                        </Box>
                      }
                    />
                  </Paper>

                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 3.5,
                      borderColor: deliveryMethod === "pickup" ? "primary.main" : "divider",
                      bgcolor: deliveryMethod === "pickup" ? (themeMode === "dark" ? "rgba(108, 93, 211, 0.1)" : "rgba(108, 93, 211, 0.04)") : "transparent",
                    }}
                  >
                    <FormControlLabel
                      value="pickup"
                      control={<Radio size="small" />}
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight={700}>
                            Store Self-Pickup (Free)
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Ready for pickup in ~15 mins
                          </Typography>
                        </Box>
                      }
                    />
                  </Paper>
                </RadioGroup>

                {/* Promo Code Coupon Section */}
                <Typography variant="subtitle2" fontWeight={800} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LocalOfferIcon color="primary" fontSize="small" /> Apply Promo Code
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                  <TextField
                    placeholder="e.g. LOCAL10"
                    size="small"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    fullWidth
                    slotProps={{
                      input: {
                        sx: { borderRadius: 2.5, fontSize: "0.875rem" },
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleApplyPromo}
                    sx={{ borderRadius: 2.5, px: 2.5, fontWeight: 700, textTransform: "none" }}
                  >
                    Apply
                  </Button>
                </Stack>

                {promoSuccess && <Alert severity="success" sx={{ mb: 2, py: 0.4, borderRadius: 2.5, fontSize: "0.8rem" }}>{promoSuccess}</Alert>}
                {promoError && <Alert severity="error" sx={{ mb: 2, py: 0.4, borderRadius: 2.5, fontSize: "0.8rem" }}>{promoError}</Alert>}

                <Divider sx={{ my: 2.5 }} />

                {/* Bill Breakdown */}
                <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                  Bill Breakdown
                </Typography>
                <Stack spacing={1.5} sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">Item Subtotal</Typography>
                    <Typography variant="body2" fontWeight={700}>₹{subtotal}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">Delivery Charge</Typography>
                    <Typography variant="body2" fontWeight={700} color={deliveryFee === 0 ? "success.main" : "text.primary"}>
                      {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">Packaging & Service Fee</Typography>
                    <Typography variant="body2" fontWeight={700}>₹{packagingFee}</Typography>
                  </Box>
                  {discount > 0 && (
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="success.main" fontWeight={700}>Coupon Discount</Typography>
                      <Typography variant="body2" fontWeight={800} color="success.main">-₹{discount}</Typography>
                    </Box>
                  )}
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <Typography variant="subtitle1" fontWeight={800}>Total Payable</Typography>
                    <Typography variant="h5" fontWeight={800} color="primary.main">
                      ₹{totalPayable}
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  onClick={handlePlaceOrder}
                  disabled={isCheckingOut}
                  sx={{
                    py: 1.5,
                    borderRadius: 3.5,
                    fontWeight: 800,
                    fontSize: "1.05rem",
                    background: "linear-gradient(135deg, #6C5DD3 0%, #FF7551 100%)",
                    boxShadow: "0 8px 25px rgba(108, 93, 211, 0.35)",
                  }}
                >
                  {isCheckingOut ? "Processing Order..." : `Proceed to Pay ₹${totalPayable}`}
                </Button>

                {/* Safety Guarantee */}
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mt: 2.5 }}>
                  <ShieldOutlined color="action" sx={{ fontSize: 18 }} />
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Secure 256-bit encrypted checkout
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>

      {/* Order Success Dialog */}
      <Dialog
        open={orderComplete}
        onClose={() => setOrderComplete(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: 5, p: 3, textAlign: "center" } },
        }}
      >
        {orderDetails && (
          <Box>
            <Avatar
              sx={{
                bgcolor: "success.main",
                width: 72,
                height: 72,
                mx: "auto",
                mb: 2,
                boxShadow: "0 10px 25px rgba(46, 125, 50, 0.3)",
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 44, color: "#FFF" }} />
            </Avatar>

            <Typography variant="h5" fontWeight={800} gutterBottom>
              Order Placed Successfully!
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Order Reference ID: <strong>{orderDetails.orderId}</strong>
            </Typography>

            <Alert severity="success" sx={{ textAlign: "left", mb: 3, borderRadius: 3 }}>
              Fulfillment Type: <strong>{orderDetails.deliveryMethod === "delivery" ? "Home Delivery" : "Store Self-Pickup"}</strong>
            </Alert>

            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                setOrderComplete(false);
                navigate("/orders");
              }}
              sx={{ borderRadius: 3, mb: 1.5, py: 1.3, fontWeight: 800, fontSize: "0.95rem" }}
            >
              View Order Status
            </Button>
            <Button variant="text" fullWidth onClick={() => navigate("/")} sx={{ fontWeight: 700 }}>
              Back to Home
            </Button>
          </Box>
        )}
      </Dialog>
    </Box>
  );
}

