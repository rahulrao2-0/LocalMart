import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
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
  LinearProgress,
  InputAdornment,
  Fade,
  Grow
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
  Celebration,
  BoltOutlined,
  VerifiedUserOutlined,
  ArrowForward as ArrowForwardIcon,
  LocalShipping,
  ShoppingBagOutlined,
  ConfirmationNumberOutlined
} from "@mui/icons-material";

const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CartPage({ cart = [], onUpdateQuantity, onRemoveFromCart, onClearCart, themeMode }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);

  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoSuccess, setPromoSuccess] = useState("");
  const [promoError, setPromoError] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [shippingAddressStr, setShippingAddressStr] = useState(
    user?.addresses?.[0]?.street || user?.address || ""
  );

  // Calculate Subtotal & Fees
  const subtotal = cart.reduce((acc, item) => acc + (item.shop?.price || 0) * item.quantity, 0);
  const deliveryFee = deliveryMethod === "delivery" ? (subtotal >= 500 ? 0 : 30) : 0;
  const packagingFee = subtotal > 0 ? 15 : 0;
  const totalPayable = Math.max(0, subtotal + deliveryFee + packagingFee - discount);
  
  // Free shipping progress logic
  const freeShippingThreshold = 500;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercentage = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleApplyPromo = (codeToApply) => {
    setPromoError("");
    setPromoSuccess("");
    const code = (codeToApply || promoCode).trim().toUpperCase();
    if (code === "LOCAL10") {
      const discAmount = Math.round(subtotal * 0.1);
      setDiscount(discAmount);
      setPromoSuccess(`🎉 Code LOCAL10 applied! Saved ₹${discAmount} (10% OFF)`);
      if (codeToApply) setPromoCode("LOCAL10");
    } else if (code === "FREESHIP") {
      setDiscount(deliveryFee);
      setPromoSuccess("🚚 Free Delivery promo applied!");
      if (codeToApply) setPromoCode("FREESHIP");
    } else {
      setPromoError("Invalid promo code. Try 'LOCAL10' or 'FREESHIP'");
    }
  };

  const handlePlaceOrder = async () => {
    if (!cart || cart.length === 0) {
      setPromoError("Your cart is empty.");
      return;
    }

    setIsCheckingOut(true);
    setPromoError("");
    setPromoSuccess("");

    try {
      const idempotencyKey = uuidv4();

      const itemsPayload = cart.map((item) => ({
        productId: item.product?.id || item.product?._id || "p1",
        productName: item.product?.name || "Product",
        quantity: item.quantity,
        price: item.shop?.price || item.product?.price || 0,
        subtotal: (item.shop?.price || item.product?.price || 0) * item.quantity,
      }));

      const primarySellerId =
        cart[0]?.shop?.sellerId ||
        cart[0]?.shop?.seller_id ||
        cart[0]?.product?.sellerId ||
        cart[0]?.product?.seller_id ||
        cart[0]?.sellerId ||
        cart[0]?.seller_id ||
        cart[0]?.shop?.id;

      const customerName = user?.fullName || user?.full_name || user?.username || user?.name || "Customer";
      const customerEmail = user?.email || "";

      if (deliveryMethod === "delivery" && (!shippingAddressStr || shippingAddressStr.trim() === "")) {
        setPromoError("Please add a shipping address in your profile to continue with delivery.");
        setIsCheckingOut(false);
        return;
      }

      const defaultAddress = {
        fullName: customerName,
        name: customerName,
        email: customerEmail,
        street: shippingAddressStr,
        city: user?.addresses?.[0]?.city || user?.location || "Local City",
        postalCode: user?.addresses?.[0]?.postalCode || "400001",
        country: user?.addresses?.[0]?.country || "IN",
        lat: user?.addresses?.[0]?.lat || user?.location?.coordinates?.[1] || 28.7041,
        lng: user?.addresses?.[0]?.lng || user?.location?.coordinates?.[0] || 77.1025,
      };





      // 1. Create Order in Backend via API Gateway (Port 3000)
      const orderRes = await fetch("http://localhost:3000/api/v1/orders/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-idempotency-key": idempotencyKey,
        },
        body: JSON.stringify({
          totalAmount: totalPayable,
          customerId: user?.id || user?._id || "guest_user",
          sellerId: primarySellerId,
          fulfillmentMode: deliveryMethod.toUpperCase(),
          items: itemsPayload,
          shippingAddress: defaultAddress,
          subtotal,
          deliveryCharge: deliveryMethod === "pickup" ? 0 : deliveryFee,
          discount,
          paymentMethod: "RAZORPAY",
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.message || "Failed to create order");
      }

      // 2. Ensure Razorpay SDK is loaded
      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded) throw new Error("Could not load Razorpay SDK. Please check your internet connection.");

      // 3. Configure Razorpay popup options
      const paymentInfo = orderData.payment || {};
      const createdOrderData = orderData.data || {};

      const options = {
        key: paymentInfo.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: paymentInfo.amount || totalPayable * 100,
        currency: paymentInfo.currency || "INR",
        name: "LocalMart",
        description: `Order ${createdOrderData.orderNumber || ''}`,
        order_id: paymentInfo.razorpayOrderId,
        prefill: {
          name: user?.fullName || user?.full_name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: { color: "#3B82F6" },

        handler: async (response) => {
          try {
            const verifyRes = await fetch("http://localhost:3000/api/v1/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setOrderDetails({
                orderId: createdOrderData.orderNumber || `LM-${Math.floor(100000 + Math.random() * 900000)}`,
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
            } else {
              setPromoError("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            setPromoError(err.message || "Payment verification failed.");
          } finally {
            setIsCheckingOut(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsCheckingOut(false);
          },
        },
      };

      // 4. Open Modal
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        setPromoError(`Payment Failed: ${response.error?.description || "Unknown error"}`);
        setIsCheckingOut(false);
      });

      rzp.open();
    } catch (error) {
      console.error("Order processing error:", error);
      setPromoError(error.message || "Something went wrong initiating checkout.");
      setIsCheckingOut(false);
    }
  };

  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: isDark
          ? "radial-gradient(circle at 10% 20%, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 1) 90%)"
          : "linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 50%, #F1F5F9 100%)",
        py: { xs: 3, sm: 5 },
        px: { xs: 2, sm: 4, md: 6 },
        transition: "all 0.3s ease",
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
            <IconButton
              onClick={() => navigate("/")}
              sx={{
                bgcolor: "background.paper",
                boxShadow: isDark
                  ? "0 8px 20px rgba(0,0,0,0.4)"
                  : "0 8px 24px rgba(149, 157, 165, 0.15)",
                borderRadius: "14px",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateX(-4px)",
                  bgcolor: "background.paper",
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  fontSize: { xs: "1.6rem", sm: "2.1rem" },
                }}
              >
                Shopping Cart
                {cart.length > 0 && (
                  <Chip
                    label={`${cart.reduce((a, b) => a + b.quantity, 0)} Items`}
                    color="primary"
                    size="medium"
                    sx={{
                      fontWeight: 800,
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
                      boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                      px: 0.5,
                    }}
                  />
                )}
              </Typography>
            </Box>
          </Box>

          {cart.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              onClick={onClearCart}
              startIcon={<DeleteOutlineIcon />}
              sx={{
                fontWeight: 700,
                borderRadius: "12px",
                borderWidth: "1.5px",
                textTransform: "none",
                px: 2.5,
                "&:hover": {
                  borderWidth: "1.5px",
                  bgcolor: "error.50",
                },
              }}
            >
              Clear Cart
            </Button>
          )}
        </Stack>

        {cart.length === 0 ? (
          /* Empty Cart State */
          <Grow in timeout={500}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 5, sm: 8 },
                textAlign: "center",
                borderRadius: "24px",
                border: "2px dashed",
                borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
                bgcolor: isDark ? "rgba(30, 41, 59, 0.4)" : "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(12px)",
                boxShadow: isDark
                  ? "0 20px 50px rgba(0,0,0,0.5)"
                  : "0 20px 50px rgba(0,0,0,0.04)",
              }}
            >
              <Avatar
                sx={{
                  width: 110,
                  height: 110,
                  mx: "auto",
                  mb: 3,
                  background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
                  color: "primary.main",
                  boxShadow: "0 10px 25px rgba(59, 130, 246, 0.2)",
                }}
              >
                <ShoppingBagOutlined sx={{ fontSize: 56 }} />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: "-0.02em" }}>
                Your Cart is Empty
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 420, mx: "auto", lineHeight: 1.6 }}>
                Looks like you haven't added any local products yet. Discover items from top-rated neighborhood stores near you!
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate("/")}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  borderRadius: "14px",
                  px: 5,
                  py: 1.8,
                  fontWeight: 800,
                  fontSize: "1.05rem",
                  textTransform: "none",
                  background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
                  boxShadow: "0 10px 25px rgba(59, 130, 246, 0.4)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Explore Local Stores
              </Button>
            </Paper>
          </Grow>
        ) : (
          /* Cart Layout */
          <Grid container spacing={4}>
            {/* Left Column: Cart Items & Free Shipping Progress */}
            <Grid item xs={12} md={7.5}>
              
              {/* Free Shipping Progress Banner */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 4,
                  borderRadius: "20px",
                  background: isDark
                    ? "linear-gradient(135deg, rgba(30, 58, 138, 0.3) 0%, rgba(17, 24, 39, 0.6) 100%)"
                    : "linear-gradient(135deg, #EFF6FF 0%, #E0F2FE 100%)",
                  border: "1px solid",
                  borderColor: isDark ? "rgba(59, 130, 246, 0.3)" : "rgba(186, 230, 253, 0.8)",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 8px 20px rgba(59, 130, 246, 0.08)",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 800,
                      color: isDark ? "#93C5FD" : "#1E40AF",
                      display: "flex",
                      alignItems: "center",
                      gap: 1.2,
                    }}
                  >
                    <BoltOutlined sx={{ color: "#F59E0B" }} /> 
                    {amountToFreeShipping > 0
                      ? `Add ₹${amountToFreeShipping} more to unlock FREE Express Delivery!`
                      : "🎉 Congratulations! You unlocked FREE Delivery!"}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "primary.main" }}>
                    {amountToFreeShipping > 0 ? `₹${subtotal} / ₹${freeShippingThreshold}` : "Unlocked!"}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progressPercentage}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.8)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 5,
                      background: "linear-gradient(90deg, #3B82F6 0%, #10B981 100%)",
                    },
                  }}
                />
              </Paper>

              {/* Items List */}
              <Stack spacing={2.5}>
                {cart.map((item, index) => (
                  <Card
                    key={`${item.product.id}-${item.shop.shopName}-${index}`}
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: "20px",
                      border: "1px solid",
                      borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                      bgcolor: isDark ? "rgba(30, 41, 59, 0.6)" : "rgba(255, 255, 255, 0.9)",
                      backdropFilter: "blur(8px)",
                      transition: "all 0.25s ease-in-out",
                      "&:hover": {
                        borderColor: "primary.main",
                        boxShadow: isDark
                          ? "0 12px 30px rgba(0,0,0,0.4)"
                          : "0 12px 30px rgba(59, 130, 246, 0.12)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2.5,
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "flex-start", sm: "center" },
                      }}
                    >
                      {/* Product Placeholder / Image */}
                      <Box
                        sx={{
                          width: { xs: "100%", sm: 96 },
                          height: 96,
                          borderRadius: "16px",
                          background: isDark
                            ? "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)"
                            : "linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 44,
                          flexShrink: 0,
                          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
                        }}
                      >
                        {item.product.category === "Furniture"
                          ? "🛋️"
                          : item.product.category === "Vegetables"
                          ? "🥬"
                          : item.product.category === "Electronics"
                          ? "📱"
                          : "🛒"}
                      </Box>

                      {/* Product Info */}
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
                          <Chip
                            icon={<StoreOutlined style={{ fontSize: 16 }} />}
                            label={item.shop.shopName}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontWeight: 700,
                              borderRadius: "8px",
                              borderColor: "primary.main",
                              color: "primary.main",
                            }}
                          />
                          <Chip
                            icon={<AccessTime style={{ fontSize: 16 }} />}
                            label={`${item.shop.distanceKm || "1.2"} km away`}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              borderRadius: "8px",
                              bgcolor: isDark ? "rgba(255,255,255,0.05)" : "grey.100",
                            }}
                          />
                        </Box>

                        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.3, fontSize: "1.05rem" }}>
                          {item.product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3, mb: 1 }}>
                          {item.product.brand || "Local Preferred Vendor"} {item.product.weight ? `(${item.product.weight})` : ''}
                        </Typography>

                        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 900 }}>
                          ₹{item.shop.price}{" "}
                          <Typography component="span" variant="caption" color="text.secondary">
                            / unit
                          </Typography>
                        </Typography>
                      </Box>

                      {/* Quantity & Delete */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "row", sm: "column" },
                          alignItems: { xs: "center", sm: "flex-end" },
                          justify: "space-between",
                          width: { xs: "100%", sm: "auto" },
                          gap: 2,
                        }}
                      >
                        <Tooltip title="Remove item">
                          <IconButton
                            color="error"
                            onClick={() => onRemoveFromCart(index)}
                            sx={{
                              bgcolor: isDark ? "rgba(239, 68, 68, 0.1)" : "error.50",
                              borderRadius: "10px",
                              p: 1,
                              "&:hover": {
                                bgcolor: "error.main",
                                color: "#FFF",
                              },
                            }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            bgcolor: isDark ? "rgba(15, 23, 42, 0.8)" : "#F8FAFC",
                            borderRadius: "14px",
                            border: "1.5px solid",
                            borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
                            p: 0.5,
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => onUpdateQuantity(index, -1)}
                            sx={{ borderRadius: "8px" }}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 800, px: 2, minWidth: 24, textAlign: "center" }}
                          >
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => onUpdateQuantity(index, 1)}
                            color="primary"
                            sx={{ borderRadius: "8px" }}
                          >
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
            <Grid item xs={12} md={4.5}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, sm: 3.5 },
                  borderRadius: "24px",
                  border: "1px solid",
                  borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
                  bgcolor: isDark ? "rgba(30, 41, 59, 0.7)" : "#FFFFFF",
                  backdropFilter: "blur(16px)",
                  position: "sticky",
                  top: 24,
                  boxShadow: isDark
                    ? "0 20px 50px rgba(0,0,0,0.4)"
                    : "0 20px 40px rgba(0,0,0,0.06)",
                }}
              >
                {/* Fulfillment Selection */}
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, fontSize: "1.1rem" }}>
                  Delivery Mode
                </Typography>
                <RadioGroup
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                  sx={{ mb: 3 }}
                >
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      mb: 1.5,
                      borderRadius: "16px",
                      borderColor: deliveryMethod === "delivery" ? "primary.main" : "divider",
                      bgcolor: deliveryMethod === "delivery"
                        ? isDark ? "rgba(59, 130, 246, 0.15)" : "#EFF6FF"
                        : "transparent",
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                      "&:hover": { borderColor: "primary.main" },
                    }}
                    onClick={() => setDeliveryMethod("delivery")}
                  >
                    <FormControlLabel
                      value="delivery"
                      control={<Radio size="small" />}
                      label={
                        <Box sx={{ ml: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1 }}>
                            <LocalShippingIcon fontSize="small" color="primary" /> Home Express Delivery
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ⚡ Delivered from local store in ~30 mins
                          </Typography>
                        </Box>
                      }
                      sx={{ m: 0, width: "100%" }}
                    />
                    
                    {deliveryMethod === "delivery" && (
                      <Box sx={{ mt: 2, ml: 4, mr: 2 }}>
                        {user?.addresses?.[0]?.street || user?.address ? (
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            📍 Delivering to: {user?.addresses?.[0]?.street || user?.address}
                          </Typography>
                        ) : (
                          <Box>
                            <Typography variant="body2" color="error" sx={{ mb: 1, fontWeight: 500 }}>
                              Address required for delivery.
                            </Typography>
                            <Button 
                              variant="outlined" 
                              size="small" 
                              onClick={() => navigate("/profile")}
                            >
                              Add Address
                            </Button>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Paper>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: "16px",
                      borderColor: deliveryMethod === "pickup" ? "primary.main" : "divider",
                      bgcolor: deliveryMethod === "pickup"
                        ? isDark ? "rgba(59, 130, 246, 0.15)" : "#EFF6FF"
                        : "transparent",
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                      "&:hover": { borderColor: "primary.main" },
                    }}
                    onClick={() => setDeliveryMethod("pickup")}
                  >
                    <FormControlLabel
                      value="pickup"
                      control={<Radio size="small" />}
                      label={
                        <Box sx={{ ml: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1 }}>
                            <StorefrontIcon fontSize="small" color="primary" /> Store Self-Pickup
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            🛍️ Ready for pickup immediately (FREE) • {cart[0]?.shop?.distance || "2.4"} km away
                          </Typography>
                        </Box>
                      }
                      sx={{ m: 0, width: "100%" }}
                    />
                  </Paper>
                </RadioGroup>

                {/* Promo Code */}
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, fontSize: "1.1rem" }}>
                  Coupons & Promos
                </Typography>
                
                {/* Available Quick Promos */}
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Chip
                    icon={<ConfirmationNumberOutlined style={{ fontSize: 16 }} />}
                    label="LOCAL10 (10% OFF)"
                    size="small"
                    onClick={() => handleApplyPromo("LOCAL10")}
                    sx={{
                      fontWeight: 700,
                      borderRadius: "8px",
                      cursor: "pointer",
                      bgcolor: isDark ? "rgba(59, 130, 246, 0.1)" : "#EFF6FF",
                      color: "primary.main",
                      "&:hover": { bgcolor: "primary.main", color: "#FFF" },
                    }}
                  />
                  <Chip
                    icon={<ConfirmationNumberOutlined style={{ fontSize: 16 }} />}
                    label="FREESHIP"
                    size="small"
                    onClick={() => handleApplyPromo("FREESHIP")}
                    sx={{
                      fontWeight: 700,
                      borderRadius: "8px",
                      cursor: "pointer",
                      bgcolor: isDark ? "rgba(59, 130, 246, 0.1)" : "#EFF6FF",
                      color: "primary.main",
                      "&:hover": { bgcolor: "primary.main", color: "#FFF" },
                    }}
                  />
                </Stack>

                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <TextField
                    placeholder="Enter coupon code"
                    size="small"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalOfferIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        bgcolor: isDark ? "rgba(15, 23, 42, 0.5)" : "#F8FAFC",
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => handleApplyPromo()}
                    sx={{
                      borderRadius: "12px",
                      px: 3,
                      fontWeight: 800,
                      boxShadow: "none",
                      textTransform: "none",
                    }}
                  >
                    Apply
                  </Button>
                </Stack>
                
                {promoSuccess && (
                  <Alert severity="success" sx={{ mb: 2.5, borderRadius: "12px", "& .MuiAlert-message": { fontWeight: 700 } }}>
                    {promoSuccess}
                  </Alert>
                )}
                {promoError && (
                  <Alert severity="error" sx={{ mb: 2.5, borderRadius: "12px", "& .MuiAlert-message": { fontWeight: 700 } }}>
                    {promoError}
                  </Alert>
                )}

                <Divider sx={{ my: 2.5, borderStyle: "dashed" }} />

                {/* Bill Breakdown */}
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, fontSize: "1.1rem" }}>
                  Payment Summary
                </Typography>
                <Stack spacing={1.8} sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">Item Subtotal</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>₹{subtotal}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">Delivery Charge</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800 }} color={deliveryFee === 0 ? "success.main" : "text.primary"}>
                      {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">Handling & Packaging</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>₹{packagingFee}</Typography>
                  </Box>
                  {discount > 0 && (
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="success.main" sx={{ fontWeight: 800 }}>Promo Discount</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 900 }} color="success.main">-₹{discount}</Typography>
                    </Box>
                  )}
                  
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: isDark ? "rgba(15, 23, 42, 0.8)" : "#F1F5F9",
                      borderRadius: "16px",
                      display: "flex",
                      justify: "space-between",
                      alignItems: "center",
                      mt: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>To Pay</Typography>
                      <Typography variant="caption" color="text.secondary">Includes all taxes</Typography>
                    </Box>
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
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    py: 1.8,
                    borderRadius: "16px",
                    fontWeight: 900,
                    fontSize: "1.05rem",
                    textTransform: "none",
                    background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
                    boxShadow: "0 10px 25px rgba(59, 130, 246, 0.4)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)",
                    },
                  }}
                >
                  {isCheckingOut ? "Processing Order..." : `Proceed to Checkout • ₹${totalPayable}`}
                </Button>

                <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mt: 2.5 }}>
                  <VerifiedUserOutlined color="success" fontSize="small" />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    Guaranteed Safe & Secure Checkout
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
        PaperProps={{
          sx: {
            borderRadius: "28px",
            p: 4,
            textAlign: "center",
            boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
            bgcolor: isDark ? "rgba(30, 41, 59, 0.95)" : "#FFF",
            backdropFilter: "blur(20px)",
          },
        }}
      >
        {orderDetails && (
          <Box>
            <Avatar
              sx={{
                background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                width: 80,
                height: 80,
                mx: "auto",
                mb: 3,
                boxShadow: "0 10px 25px rgba(16, 185, 129, 0.4)",
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 50, color: "#FFF" }} />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: "-0.02em" }}>
              Order Placed!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Order Reference: <strong style={{ color: theme.palette.primary.main }}>{orderDetails.orderId}</strong>
            </Typography>
            
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                mb: 3.5,
                borderRadius: "16px",
                bgcolor: isDark ? "rgba(15, 23, 42, 0.6)" : "#F8FAFC",
                textAlign: "left",
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 0.5 }}>
                Summary
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Total Paid:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 900, color: "primary.main" }}>₹{orderDetails.totalPayable}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Method:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                  {orderDetails.deliveryMethod === "delivery" ? "⚡ Express Delivery" : "🛍️ Store Pickup"}
                </Typography>
              </Box>
            </Paper>

            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate("/")}
              sx={{
                borderRadius: "14px",
                py: 1.5,
                fontWeight: 800,
                textTransform: "none",
                background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
              }}
            >
              Back to Home
            </Button>
          </Box>
        )}
      </Dialog>
    </Box>
  );
}

