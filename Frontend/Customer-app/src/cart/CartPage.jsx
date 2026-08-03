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
  LinearProgress
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
  LocalOfferOutlined as LocalOfferIcon,
  ShieldOutlined,
  AccessTime,
  StoreOutlined,
  Celebration
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
  const deliveryFee = deliveryMethod === "delivery" ? (subtotal >= 500 ? 0 : 30) : 0;
  const packagingFee = subtotal > 0 ? 15 : 0;
  const totalPayable = Math.max(0, subtotal + deliveryFee + packagingFee - discount);
  
  // Free shipping progress logic
  const freeShippingThreshold = 500;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercentage = Math.min(100, (subtotal / freeShippingThreshold) * 100);

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
    } else {
      setPromoError("Invalid promo code. Try 'LOCAL10'");
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
        py: { xs: 2, sm: 4 },
        px: { xs: 1.5, sm: 3, md: 4 },
      }}
    >
      <Container maxWidth="lg">
        {/* Header Navigation */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 4 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton onClick={() => navigate("/")} sx={{ bgcolor: 'background.paper', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -1, display: "flex", alignItems: "center", gap: 1.5 }}>
                Your Cart
                {cart.length > 0 && (
                  <Chip label={`${cart.reduce((a, b) => a + b.quantity, 0)} Items`} color="primary" sx={{ fontWeight: 800, borderRadius: 2 }} />
                )}
              </Typography>
            </Box>
          </Box>

          {cart.length > 0 && (
            <Button
              variant="text"
              color="error"
              onClick={onClearCart}
              startIcon={<DeleteOutlineIcon />}
              sx={{ fontWeight: 800, borderRadius: 2 }}
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
              p: { xs: 5, sm: 8 },
              textAlign: "center",
              borderRadius: 6,
              border: "1px dashed",
              borderColor: "divider",
              bgcolor: "transparent",
            }}
          >
            <Avatar sx={{ width: 120, height: 120, mx: "auto", mb: 3, bgcolor: 'primary.50', color: "primary.main" }}>
              <ShoppingCartIcon sx={{ fontSize: 64 }} />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
              Your Cart is Empty
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: "auto" }}>
              Discover amazing products from your local neighborhood stores.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate("/")}
              sx={{ borderRadius: 3, px: 5, py: 1.5, fontWeight: 800, fontSize: "1.1rem" }}
            >
              Explore Nearby Shops
            </Button>
          </Paper>
        ) : (
          /* Cart Layout */
          <Grid container spacing={4}>
            {/* Left Column: Cart Items & Free Shipping Progress */}
            <Grid item xs={12} md={8}>
              
              {/* Free Shipping Progress Bar */}
              <Paper sx={{ p: 3, mb: 4, borderRadius: 4, border: '1px solid', borderColor: 'primary.100', bgcolor: 'primary.50' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.dark', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Celebration fontSize="small" /> 
                    {amountToFreeShipping > 0 ? `Add ₹${amountToFreeShipping} more for FREE Delivery!` : "You unlocked FREE Delivery!"}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    {amountToFreeShipping > 0 ? `₹${subtotal} / ₹${freeShippingThreshold}` : 'Goal Reached!'}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={progressPercentage} 
                  sx={{ height: 10, borderRadius: 5, bgcolor: 'primary.100', '& .MuiLinearProgress-bar': { borderRadius: 5 } }} 
                />
              </Paper>

              <Stack spacing={3}>
                {cart.map((item, index) => (
                  <Card
                    key={`${item.product.id}-${item.shop.shopName}-${index}`}
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 4,
                      border: "1px solid",
                      borderColor: "divider",
                      transition: "0.2s ease",
                      "&:hover": { borderColor: "primary.main", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" },
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 3, flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: 'flex-start', sm: 'center' } }}>
                      
                      {/* Product Placeholder Image */}
                      <Box sx={{ width: 100, height: 100, borderRadius: 3, bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, flexShrink: 0 }}>
                        {item.product.category === "Furniture" ? "🛋️" : item.product.category === "Vegetables" ? "🥬" : "🛒"}
                      </Box>

                      {/* Product Info */}
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                          <Chip icon={<StoreOutlined />} label={item.shop.shopName} size="small" variant="outlined" sx={{ fontWeight: 700, borderRadius: 1.5 }} />
                          <Chip icon={<AccessTime />} label={`${item.shop.distanceKm} km`} size="small" sx={{ fontWeight: 700, borderRadius: 1.5, bgcolor: 'grey.100' }} />
                        </Box>

                        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                          {item.product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1 }}>
                          {item.product.brand}
                        </Typography>

                        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 900 }}>
                          ₹{item.shop.price}
                        </Typography>
                      </Box>

                      {/* Quantity & Delete */}
                      <Box sx={{ display: "flex", flexDirection: { xs: 'row', sm: 'column' }, alignItems: { xs: 'center', sm: 'flex-end' }, justifyContent: 'space-between', width: { xs: '100%', sm: 'auto' }, gap: 2 }}>
                        <Tooltip title="Remove">
                          <IconButton color="error" onClick={() => onRemoveFromCart(index)} sx={{ bgcolor: 'error.50' }}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Box sx={{ display: "flex", alignItems: "center", bgcolor: "background.default", borderRadius: 10, border: '1px solid', borderColor: 'divider', p: 0.5 }}>
                          <IconButton size="small" onClick={() => onUpdateQuantity(index, -1)}>
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography variant="body1" sx={{ fontWeight: 800, px: 2, minWidth: 20, textAlign: "center" }}>
                            {item.quantity}
                          </Typography>
                          <IconButton size="small" onClick={() => onUpdateQuantity(index, 1)} color="primary">
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </Card>
                ))}
              </Stack>
            </Grid>

            {/* Right Column: Checkout Summary */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 5,
                  border: "1px solid",
                  borderColor: "divider",
                  position: "sticky",
                  top: 24,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.03)'
                }}
              >
                {/* Fulfillment Selection */}
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Fulfillment
                </Typography>
                <RadioGroup value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value)} sx={{ mb: 4 }}>
                  <Paper variant="outlined" sx={{ p: 2, mb: 1.5, borderRadius: 3, borderColor: deliveryMethod === "delivery" ? "primary.main" : "divider", bgcolor: deliveryMethod === "delivery" ? 'primary.50' : 'transparent', transition: 'all 0.2s' }}>
                    <FormControlLabel
                      value="delivery"
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Home Delivery</Typography>
                          <Typography variant="caption" color="text.secondary">Usually within 30 mins</Typography>
                        </Box>
                      }
                      sx={{ m: 0, width: '100%' }}
                    />
                  </Paper>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, borderColor: deliveryMethod === "pickup" ? "primary.main" : "divider", bgcolor: deliveryMethod === "pickup" ? 'primary.50' : 'transparent', transition: 'all 0.2s' }}>
                    <FormControlLabel
                      value="pickup"
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Store Pickup (Free)</Typography>
                          <Typography variant="caption" color="text.secondary">Pick up yourself</Typography>
                        </Box>
                      }
                      sx={{ m: 0, width: '100%' }}
                    />
                  </Paper>
                </RadioGroup>

                {/* Promo Code */}
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Offers & Promos
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <TextField
                    placeholder="Enter code (e.g. LOCAL10)"
                    size="small"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                  <Button variant="contained" onClick={handleApplyPromo} sx={{ borderRadius: 3, px: 3, fontWeight: 800, boxShadow: 'none' }}>
                    Apply
                  </Button>
                </Stack>
                {promoSuccess && <Alert severity="success" sx={{ mb: 3, borderRadius: 2, '& .MuiAlert-message': { fontWeight: 'bold' } }}>{promoSuccess}</Alert>}
                {promoError && <Alert severity="error" sx={{ mb: 3, borderRadius: 2, '& .MuiAlert-message': { fontWeight: 'bold' } }}>{promoError}</Alert>}

                <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

                {/* Bill Breakdown */}
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Bill Details
                </Typography>
                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body1" color="text.secondary">Subtotal</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 800 }}>₹{subtotal}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body1" color="text.secondary">Delivery Fee</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 800 }} color={deliveryFee === 0 ? "success.main" : "text.primary"}>
                      {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body1" color="text.secondary">Packaging Fee</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 800 }}>₹{packagingFee}</Typography>
                  </Box>
                  {discount > 0 && (
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body1" color="success.main" sx={{ fontWeight: 800 }}>Discount Applied</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 900 }} color="success.main">-₹{discount}</Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 3, display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>Total Payable</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: "primary.main" }}>
                      ₹{totalPayable}
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handlePlaceOrder}
                  disabled={isCheckingOut}
                  sx={{ py: 2, borderRadius: 3, fontWeight: 900, fontSize: "1.1rem" }}
                >
                  {isCheckingOut ? "Processing..." : `Checkout • ₹${totalPayable}`}
                </Button>

                <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mt: 3 }}>
                  <ShieldOutlined color="action" fontSize="small" />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    100% Secure & Encrypted Payments
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
        PaperProps={{ sx: { borderRadius: 6, p: 4, textAlign: "center", boxShadow: '0 20px 60px rgba(0,0,0,0.1)' } }}
      >
        {orderDetails && (
          <Box>
            <Avatar sx={{ bgcolor: "success.main", width: 80, height: 80, mx: "auto", mb: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 50, color: "#FFF" }} />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: -0.5 }}>
              Order Confirmed!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Reference ID: <strong style={{ color: '#000' }}>{orderDetails.orderId}</strong>
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 4, borderRadius: 3, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Fulfillment</Typography>
              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 800 }}>
                {orderDetails.deliveryMethod === "delivery" ? "🚀 Fast Home Delivery" : "🏪 Store Self-Pickup"}
              </Typography>
            </Paper>
            <Button variant="contained" fullWidth onClick={() => navigate("/")} sx={{ borderRadius: 3, py: 1.5, fontWeight: 800 }}>
              Continue Shopping
            </Button>
          </Box>
        )}
      </Dialog>
    </Box>
  );
}
