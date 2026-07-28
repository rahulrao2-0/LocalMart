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
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  ShoppingCart as ShoppingCartIcon,
  DeleteOutlined as DeleteOutlineIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ArrowBack as ArrowBackIcon,
  LocalShipping as LocalShippingIcon,
  Storefront as StorefrontIcon,
  CheckCircle as CheckCircleIcon,
  ShoppingBagOutlined as ShoppingBagIcon,
  DiscountOutlined as DiscountIcon,
  LocationOn as LocationOnIcon,
  Payment as PaymentIcon,
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
  const subtotal = cart.reduce((acc, item) => acc + item.shop.price * item.quantity, 0);
  const deliveryFee = deliveryMethod === "delivery" ? (subtotal > 0 ? 30 : 0) : 0;
  const packagingFee = subtotal > 0 ? 15 : 0;
  const totalPayable = Math.max(0, subtotal + deliveryFee + packagingFee - discount);

  const handleApplyPromo = () => {
    setPromoError("");
    setPromoSuccess("");
    if (promoCode.trim().toUpperCase() === "LOCAL10") {
      const discAmount = Math.round(subtotal * 0.1);
      setDiscount(discAmount);
      setPromoSuccess(`Promo applied! Saved ₹${discAmount} (10% OFF)`);
    } else if (promoCode.trim().toUpperCase() === "FREESHIP") {
      setDiscount(deliveryFee);
      setPromoSuccess("Free Delivery promo applied!");
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
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4, px: { xs: 2, md: 4 } }}>
      <Container maxWidth="lg">
        {/* Header Navigation */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <IconButton onClick={() => navigate("/")} sx={{ bgcolor: "background.paper", boxShadow: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <ShoppingCartIcon color="primary" fontSize="large" /> Your Shopping Cart
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Review items from local nearby stores before placing order
            </Typography>
          </Box>
        </Stack>

        {cart.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: "auto",
                mb: 2,
                bgcolor: themeMode === "dark" ? "rgba(108, 93, 211, 0.2)" : "rgba(108, 93, 211, 0.1)",
                color: "primary.main",
              }}
            >
              <ShoppingCartIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Your cart is currently empty
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Explore nearby grocery, fresh produce, and local shops in your area!
            </Typography>
            <Button variant="contained" color="primary" size="large" onClick={() => navigate("/")} sx={{ borderRadius: 3, px: 4 }}>
              Start Shopping Now
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={4}>
            {/* Left Column: Cart Items List */}
            <Grid item xs={12} md={8}>
              <Stack spacing={2.5}>
                {cart.map((item, index) => (
                  <Card
                    key={`${item.product.id}-${item.shop.shopName}-${index}`}
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 4,
                      border: "1px solid",
                      borderColor: "divider",
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "flex-start", sm: "center" },
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <Chip
                          label={item.shop.shopName}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 700, borderRadius: 2 }}
                        />
                        <Chip
                          label={`${item.shop.distanceKm || 0.8} km away`}
                          size="small"
                          sx={{ fontSize: 11 }}
                        />
                      </Stack>
                      <Typography variant="h6" fontWeight={700}>
                        {item.product.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Brand/Make: {item.product.brand || "Local Quality"} | Category: {item.product.category || "General"}
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={800} color="primary.main" sx={{ mt: 0.5 }}>
                        ₹{item.shop.price} <Typography component="span" variant="caption" color="text.secondary">per unit</Typography>
                      </Typography>
                    </Box>

                    <Stack direction="row" alignItems="center" spacing={2} sx={{ width: { xs: "100%", sm: "auto" }, justifyContent: "space-between" }}>
                      {/* Quantity Selector */}
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ bgcolor: "action.hover", borderRadius: 3, p: 0.5 }}>
                        <IconButton size="small" onClick={() => onUpdateQuantity(index, -1)}>
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="body1" fontWeight={700} sx={{ px: 1 }}>
                          {item.quantity}
                        </Typography>
                        <IconButton size="small" onClick={() => onUpdateQuantity(index, 1)}>
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Stack>

                      <Typography variant="h6" fontWeight={800} sx={{ minWidth: 80, textAlign: "right" }}>
                        ₹{item.shop.price * item.quantity}
                      </Typography>

                      <IconButton color="error" onClick={() => onRemoveFromCart(index)}>
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Grid>

            {/* Right Column: Order Summary & Fulfillment */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  position: "sticky",
                  top: 20,
                }}
              >
                <Typography variant="h6" fontWeight={800} gutterBottom>
                  Fulfillment Mode
                </Typography>
                <RadioGroup value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value)} sx={{ mb: 3 }}>
                  <Paper variant="outlined" sx={{ p: 1.5, mb: 1, borderRadius: 3 }}>
                    <FormControlLabel
                      value="delivery"
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <LocalShippingIcon color="primary" fontSize="small" /> Home Delivery
                          </Typography>
                          <Typography variant="caption" color="text.secondary">Delivered from nearby store in ~30 mins</Typography>
                        </Box>
                      }
                    />
                  </Paper>
                  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 3 }}>
                    <FormControlLabel
                      value="pickup"
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <StorefrontIcon color="secondary" fontSize="small" /> Store Self-Pickup
                          </Typography>
                          <Typography variant="caption" color="text.secondary">Ready for pickup in 15 mins (Free)</Typography>
                        </Box>
                      }
                    />
                  </Paper>
                </RadioGroup>

                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Apply Promo Code
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <TextField
                    placeholder="e.g. LOCAL10"
                    size="small"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    fullWidth
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
                  />
                  <Button variant="outlined" onClick={handleApplyPromo} sx={{ borderRadius: 2.5, px: 2, fontWeight: 700 }}>
                    Apply
                  </Button>
                </Stack>
                {promoSuccess && <Alert severity="success" sx={{ mb: 2, py: 0.5, borderRadius: 2 }}>{promoSuccess}</Alert>}
                {promoError && <Alert severity="error" sx={{ mb: 2, py: 0.5, borderRadius: 2 }}>{promoError}</Alert>}

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" fontWeight={800} gutterBottom>
                  Payment Breakdown
                </Typography>
                <Stack spacing={1.5} sx={{ mb: 3 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Items Subtotal</Typography>
                    <Typography variant="body2" fontWeight={700}>₹{subtotal}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Delivery Fee</Typography>
                    <Typography variant="body2" fontWeight={700} color={deliveryFee === 0 ? "success.main" : "text.primary"}>
                      {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Packaging & Platform</Typography>
                    <Typography variant="body2" fontWeight={700}>₹{packagingFee}</Typography>
                  </Stack>
                  {discount > 0 && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="success.main">Discount</Typography>
                      <Typography variant="body2" fontWeight={700} color="success.main">-₹{discount}</Typography>
                    </Stack>
                  )}
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="subtitle1" fontWeight={800}>Total Payable</Typography>
                    <Typography variant="h6" fontWeight={800} color="primary.main">₹{totalPayable}</Typography>
                  </Stack>
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
                    borderRadius: 3,
                    fontWeight: 800,
                    fontSize: "1.05rem",
                    background: "linear-gradient(135deg, #6C5DD3 0%, #FF7551 100%)",
                  }}
                >
                  {isCheckingOut ? "Processing Order..." : `Proceed to Pay ₹${totalPayable}`}
                </Button>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>

      {/* Order Success Dialog */}
      <Dialog open={orderComplete} onClose={() => setOrderComplete(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 2, textAlign: "center" } }}>
        {orderDetails && (
          <Box>
            <Avatar sx={{ bgcolor: "success.main", width: 64, height: 64, mx: "auto", mb: 2 }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: "#FFF" }} />
            </Avatar>
            <Typography variant="h5" fontWeight={800} gutterBottom>
              Order Placed Successfully!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Order ID: <strong>{orderDetails.orderId}</strong>
            </Typography>
            <Alert severity="success" sx={{ textAlign: "left", mb: 3, borderRadius: 3 }}>
              Fulfillment: <strong>{orderDetails.deliveryMethod === "delivery" ? "Home Delivery" : "Store Self-Pickup"}</strong>
            </Alert>
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                setOrderComplete(false);
                navigate("/orders");
              }}
              sx={{ borderRadius: 3, mb: 1, py: 1.2, fontWeight: 700 }}
            >
              View My Orders
            </Button>
            <Button variant="text" fullWidth onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </Box>
        )}
      </Dialog>
    </Box>
  );
}
