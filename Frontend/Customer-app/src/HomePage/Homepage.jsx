import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from "../services/productApi";
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Chip,
  Stack,
  Drawer,
  IconButton,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Rating,
  Card,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Place as PlaceIcon,
  Close as CloseIcon,
  ShoppingCart as ShoppingCartIcon,
  DeleteOutlined as DeleteOutlineIcon,
  LocalShipping as LocalShippingIcon,
  Storefront as StorefrontIcon,
  TrendingUp as TrendingUpIcon,
  MapOutlined as MapOutlinedIcon,
  NavigationOutlined as NavigationOutlinedIcon,
  Star as StarIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Done as DoneIcon,
} from "@mui/icons-material";
import SearchBar from "./SearchBar";
import CategorySection from "./CategorySection";
import LocalNeighborhoodMap from "./LocalNeighborhoodMap";




const categories = ["All", "Vegetables", "Furniture", "Electronics","Waters"];

export default function HomePage({ themeMode, onToggleTheme, currentUser, onLogout, onNavigate, cart = [], onAddToCart }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState("delivery"); // delivery | pickup
  const [location, setLocation] = useState("Vijay Nagar, Indore");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [allProducts, setAllProducts] = useState([]); 

  // Shop comparison details dialog
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Cart State
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Map interactive state
  const [hoveredShop, setHoveredShop] = useState(null);
  const [selectedShopOnMap, setSelectedShopOnMap] = useState(null);

  // Checkout Success State
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Homepage no longer fetches products! Each CategorySection handles its own horizontal fetching.

  // Cart operations
  const handleAddToCart = (product, selectedMode = mode, specificShop = null) => {
    const shopToBuyFrom = specificShop || product.shops.find((s) => s.shopName === product.nearestShop) || product.shops[0];
    
    setCart((prevCart) => {
      // Check if product from the same shop and fulfillment mode is already in cart
      const existingItemIndex = prevCart.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.shop.shopName === shopToBuyFrom.shopName &&
          item.fulfillmentMode === selectedMode
      );

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += 1;
        return newCart;
      } else {
        return [
          ...prevCart,
          {
            product,
            quantity: 1,
            shop: shopToBuyFrom,
            fulfillmentMode: selectedMode,
          },
        ];
      }
    });

    // Briefly show details or confirm
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (index, delta) => {
    setCart((prevCart) => {
      const newCart = [...prevCart];
      const newQty = newCart[index].quantity + delta;
      if (newQty <= 0) {
        newCart.splice(index, 1);
      } else {
        newCart[index].quantity = newQty;
      }
      return newCart;
    });
  };

  const handleRemoveFromCart = (index) => {
    setCart((prevCart) => prevCart.filter((_, idx) => idx !== index));
  };

  const cartTotalQty = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Cart Financials
  const cartSubtotal = cart.reduce((acc, item) => acc + item.shop.price * item.quantity, 0);
  
  // Dynamic delivery fee based on nearest shop distance (₹20 base + ₹10/km)
  const cartDeliveryFee = useMemo(() => {
    if (cart.length === 0) return 0;
    const hasDeliveryItems = cart.some((item) => item.fulfillmentMode === "delivery");
    if (!hasDeliveryItems) return 0;

    // Find the max distance among delivery items in the cart
    const maxDistance = cart
      .filter((item) => item.fulfillmentMode === "delivery")
      .reduce((max, item) => (item.shop.distanceKm > max ? item.shop.distanceKm : max), 0);

    return Math.round(20 + maxDistance * 10);
  }, [cart]);

  const packagingFee = cart.length > 0 ? 5 : 0;
  const cartTotalPayable = cartSubtotal + cartDeliveryFee + packagingFee;

  // Checkout process
  const handleProceedCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setCheckoutDetails({
        orderId: `LM-${Math.floor(100000 + Math.random() * 900000)}`,
        items: [...cart],
        subtotal: cartSubtotal,
        deliveryFee: cartDeliveryFee,
        packagingFee,
        total: cartTotalPayable,
        mode: cart[0]?.fulfillmentMode || "delivery",
        estTime: cart[0]?.fulfillmentMode === "delivery" ? "20-30 mins" : "Ready in 15 mins",
      });
      setCart([]);
      setCheckoutComplete(true);
    }, 1500);
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", pb: 10 }}>
      {/* HERO BANNER */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #6C5DD3 0%, #4E3EAB 50%, #FF7551 100%)",
          color: "#FFFFFF",
          pt: { xs: 6, md: 8 },
          pb: { xs: 8, md: 10 },
          px: 2,
          position: "relative",
          overflow: "hidden",
          mb: 4,
          textAlign: "center",
        }}
      >
        {/* Animated background rings */}
        <Box
          sx={{
            position: "absolute",
            top: "-20%",
            left: "-10%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.03)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "-30%",
            right: "-10%",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "rgba(255, 117, 81, 0.08)",
            pointerEvents: "none",
          }}
        />

        <Container maxWidth="md">
          <Typography
            variant="h3"
            fontWeight={800}
            sx={{
              fontSize: { xs: "2.2rem", md: "3.5rem" },
              letterSpacing: "-1px",
              lineHeight: 1.15,
              mb: 2,
            }}
          >
            Hyperlocal Shopping, <br />
            <span style={{ color: "#FF9C84" }}>Direct From Your Neighbors.</span>
          </Typography>
          <Typography
            variant="h6"
            fontWeight={500}
            sx={{
              opacity: 0.9,
              mb: 4,
              fontSize: { xs: "1rem", md: "1.25rem" },
              maxWidth: 600,
              mx: "auto",
            }}
          >
            Find fresh vegetables, handcrafted furniture, and electronics from verified local sellers with instant delivery or quick pickup.
          </Typography>

          <Box sx={{ maxWidth: 650, mx: "auto" }}>
            <SearchBar onSearch={setSearchQuery} />
          </Box>
        </Container>
      </Box>

      {/* CORE CONTENT LAYOUT */}
      <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, sm: 3, md: 5 } }}>
        <Grid container spacing={{ xs: 4, md: 5 }}>
          {/* LEFT SIDEBAR: MAP & DISCOVERY */}
          <Grid size={{ xs: 12, md: 4.8, lg: 4.5 }} sx={{ order: { xs: 2, md: 1 }, mb: { xs: 4, md: 0 } }}>
            <LocalNeighborhoodMap
              themeMode={themeMode}
              selectedShop={selectedShopOnMap}
              onSelectShop={setSelectedShopOnMap}
              onHoverShop={setHoveredShop}
            />
          </Grid>

          {/* RIGHT MAIN AREA: CATEGORY CHIPS & PRODUCT LIST */}
          <Grid size={{ xs: 12, md: 7.2, lg: 7.5 }} sx={{ order: { xs: 1, md: 2 } }}>
            {/* Category Chips Bar */}
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                overflowX: "auto",
                pb: 2.5,
                mb: 2,
                "&::-webkit-scrollbar": { height: 4 },
                "&::-webkit-scrollbar-thumb": { bgcolor: "divider", borderRadius: 2 },
              }}
            >
              {categories.map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  onClick={() => setSelectedCategory(cat)}
                  variant={selectedCategory === cat ? "filled" : "outlined"}
                  color={selectedCategory === cat ? "primary" : "default"}
                  sx={{
                    px: 1.5,
                    py: 2,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    "&:hover": {
                      transform: "scale(1.02)",
                    },
                    transition: "all 0.2s ease",
                  }}
                />
              ))}
            </Box>

            {/* SECTIONS */}
            <>
              {/* FRESH VEGETABLES ROW */}
              {(selectedCategory === "All" || selectedCategory === "Vegetables") && (
                <CategorySection
                  title="🥬 Fresh Vegetables"
                  subtitle="Direct from nearby farms & local grocery stores"
                  category="Vegetables"
                  searchQuery={searchQuery}
                  onAddToCart={handleAddToCart}
                  onProductClick={(p) => navigate(`/product/${p.id}`)}
                  mode={mode}
                  onSeeAll={() => setSelectedCategory("Vegetables")}
                />
              )}

              {/* FURNITURE ROW */}
              {(selectedCategory === "All" || selectedCategory === "Furniture") && (
                <CategorySection
                  title="🛋️ Premium Furniture"
                  subtitle="Handcrafted tables, chairs, and bookshelves from local workshops"
                  category="Furniture"
                  searchQuery={searchQuery}
                  onAddToCart={handleAddToCart}
                  onProductClick={(p) => navigate(`/product/${p.id}`)}
                  mode={mode}
                  onSeeAll={() => setSelectedCategory("Furniture")}
                />
              )}

              {/* ELECTRONICS ROW */}
              {(selectedCategory === "All" || selectedCategory === "Electronics") && (
                <CategorySection
                  title="🔌 Tech & Electronics"
                  subtitle="Compare specs & prices at tech stores near you"
                  category="Electronics"
                  searchQuery={searchQuery}
                  onAddToCart={handleAddToCart}
                  onProductClick={(p) => navigate(`/product/${p.id}`)}
                  mode={mode}
                  onSeeAll={() => setSelectedCategory("Electronics")}
                />
              )}

              {/* OTHER PRODUCTS ROW */}
              {(selectedCategory === "All" || (!["Vegetables", "Furniture", "Electronics"].includes(selectedCategory))) && (
                <CategorySection
                  title="📦 Other Products"
                  subtitle="Discover more items from local sellers"
                  category="General"
                  searchQuery={searchQuery}
                  onAddToCart={handleAddToCart}
                  onProductClick={(p) => navigate(`/product/${p.id}`)}
                  mode={mode}
                  onSeeAll={() => {}}
                />
              )}
            </>
          </Grid>
        </Grid>
      </Container>

      {/* MINI-CART SIDEBAR DRAWER */}
      <Drawer
        anchor="right"
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 380 },
            p: 3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          },
        }}
      >
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <ShoppingCartIcon color="primary" />
              <Typography variant="h6" fontWeight={800}>
                Your Cart ({cartTotalQty})
              </Typography>
            </Stack>
            <IconButton onClick={() => setIsCartOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {/* Cart Items List */}
          {cart.length === 0 ? (
            <Box sx={{ py: 10, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary" fontWeight={600}>
                Your cart is empty
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                Add items from nearby local shops to start shopping!
              </Typography>
              <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={() => setIsCartOpen(false)}>
                Browse Catalog
              </Button>
            </Box>
          ) : (
            <List sx={{ flexGrow: 1, overflowY: "auto", pr: 1 }}>
              {cart.map((item, index) => (
                <ListItem
                  key={`${item.product.id}-${item.shop.shopName}-${item.fulfillmentMode}`}
                  disableGutters
                  sx={{
                    mb: 2.5,
                    alignItems: "flex-start",
                    p: 1.5,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    position: "relative",
                  }}
                >
                  <ListItemText
                    primary={item.product.name}
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Shop: <strong>{item.shop.shopName}</strong> ({item.shop.distanceKm} km)
                        </Typography>
                        <Chip
                          label={item.fulfillmentMode === "delivery" ? "Home Delivery" : "Store Pickup"}
                          size="small"
                          color={item.fulfillmentMode === "delivery" ? "primary" : "secondary"}
                          icon={item.fulfillmentMode === "delivery" ? <LocalShippingIcon sx={{ fontSize: 12 }} /> : <StorefrontIcon sx={{ fontSize: 12 }} />}
                          sx={{ height: 18, fontSize: 9, mt: 0.5, fontWeight: 700 }}
                        />
                        <Typography variant="body2" color="primary" fontWeight={800} sx={{ mt: 1 }}>
                          ₹{item.shop.price} each
                        </Typography>
                      </Box>
                    }
                    primaryTypographyProps={{ fontWeight: 700 }}
                  />

                  {/* Quantity Controls */}
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                    <IconButton size="small" onClick={() => handleUpdateQuantity(index, -1)}>
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="body2" fontWeight={700}>
                      {item.quantity}
                    </Typography>
                    <IconButton size="small" onClick={() => handleUpdateQuantity(index, 1)}>
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Stack>

                  {/* Delete Button */}
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveFromCart(index)}
                    sx={{ position: "absolute", top: 8, right: 8 }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {/* Footer Financials and Action */}
        {cart.length > 0 && (
          <Box sx={{ pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Subtotal
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                ₹{cartSubtotal}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Hyperlocal Delivery Fee
              </Typography>
              <Typography variant="body2" fontWeight={700} color={cartDeliveryFee === 0 ? "success.main" : "text.primary"}>
                {cartDeliveryFee === 0 ? "FREE (Store Pickup)" : `₹${cartDeliveryFee}`}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Packaging & Platform
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                ₹{packagingFee}
              </Typography>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={800}>
                Total Payable
              </Typography>
              <Typography variant="h6" fontWeight={800} color="primary.main">
                ₹{cartTotalPayable}
              </Typography>
            </Stack>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              onClick={handleProceedCheckout}
              disabled={isCheckingOut}
              sx={{ py: 1.5, fontSize: 16, fontWeight: 700 }}
            >
              {isCheckingOut ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                `Place Hyperlocal Order (₹${cartTotalPayable})`
              )}
            </Button>
          </Box>
        )}
      </Drawer>

      {/* SHOP DETAILS & COMPARISON DIALOG */}
      <Dialog
        open={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, p: 1 },
        }}
      >
        {selectedProduct && (
          <>
            <DialogTitle sx={{ m: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="caption" color="primary" fontWeight={800} sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {selectedProduct.category}
                </Typography>
                <Typography variant="h5" fontWeight={800}>
                  {selectedProduct.name}
                </Typography>
              </Box>
              <IconButton onClick={() => setSelectedProduct(null)}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ px: 3, py: 2 }}>
              <Typography variant="body2" color="text.secondary" paragraph>
                This product is sold by multiple sellers in your neighborhood. Compare prices, ratings, and shop distances to make the smartest purchase.
              </Typography>

              {/* Table comparisons */}
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: "background.subtle" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Shop & Rating</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Distance</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Price</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedProduct.shops.map((shop) => (
                      <TableRow
                        key={shop.shopName}
                        sx={{
                          opacity: shop.isOpen ? 1 : 0.6,
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            {shop.shopName}
                          </Typography>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <StarIcon sx={{ fontSize: 12, color: "warning.main" }} />
                            <Typography variant="caption" color="text.secondary">
                              {shop.rating} · {shop.isOpen ? "Open" : "Closed"}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            {shop.distanceKm} km
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            ETA: {Math.round(15 + shop.distanceKm * 5)}m
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={800} color="primary.main">
                            ₹{shop.price}
                          </Typography>
                          {shop.price === Math.min(...selectedProduct.shops.map((s) => s.price)) && (
                            <Chip
                              label="Best Value"
                              size="small"
                              color="success"
                              variant="outlined"
                              sx={{ height: 16, fontSize: 8, fontWeight: 700, mt: 0.25 }}
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="contained"
                            color={mode === "pickup" ? "secondary" : "primary"}
                            disabled={mode === "pickup" && !shop.isOpen}
                            onClick={() => {
                              handleAddToCart(selectedProduct, mode, shop);
                              setSelectedProduct(null);
                            }}
                            sx={{ fontSize: 11, py: 0.5, borderRadius: 2 }}
                          >
                            Add
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* CHECKOUT SUCCESS MODAL */}
      <Dialog
        open={checkoutComplete}
        onClose={() => setCheckoutComplete(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, p: 2, textAlign: "center" },
        }}
      >
        {checkoutDetails && (
          <Box>
            <Avatar sx={{ bgcolor: "success.main", width: 60, height: 60, mx: "auto", mb: 2 }}>
              <DoneIcon sx={{ fontSize: 34, color: "#FFFFFF" }} />
            </Avatar>
            <Typography variant="h5" fontWeight={800} gutterBottom>
              Order Placed!
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
              Order ID: <strong>{checkoutDetails.orderId}</strong>
            </Typography>

            <Alert severity="success" sx={{ mb: 3, textAlign: "left", borderRadius: 2.5 }}>
              Fulfillment:{" "}
              <strong>
                {checkoutDetails.mode === "delivery" ? "Home Delivery" : "Store Pickup"}
              </strong>{" "}
              <br />
              Estimate: <strong>{checkoutDetails.estTime}</strong>
            </Alert>

            <Box sx={{ border: "1px dashed", borderColor: "divider", borderRadius: 3, p: 2, mb: 3, textAlign: "left" }}>
              <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                Payment Summary
              </Typography>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">Items Subtotal</Typography>
                <Typography variant="caption" fontWeight={700}>₹{checkoutDetails.subtotal}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">Hyperlocal Delivery</Typography>
                <Typography variant="caption" fontWeight={700}>₹{checkoutDetails.deliveryFee}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">Packaging & Platform</Typography>
                <Typography variant="caption" fontWeight={700}>₹{checkoutDetails.packagingFee}</Typography>
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" fontWeight={800}>Total Paid</Typography>
                <Typography variant="body2" fontWeight={800} color="primary.main">₹{checkoutDetails.total}</Typography>
              </Stack>
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={() => setCheckoutComplete(false)}
              sx={{ borderRadius: 3 }}
            >
              Continue Shopping
            </Button>
          </Box>
        )}
      </Dialog>
    </Box>
  );
}
