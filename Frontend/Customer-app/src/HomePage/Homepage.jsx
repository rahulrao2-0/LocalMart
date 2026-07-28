import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import Navbar from "./Navbar";
import SearchBar from "./SearchBar";
import CategorySection from "./CategorySection";

// Rich Mock Data Structure containing multiple shops for each product
const allProducts = [
  {
    id: "v1",
    name: "Onions 1kg",
    category: "Vegetables",
    rating: 4.6,
    supportsDelivery: true,
    supportsPickup: true,
    shops: [
      { shopName: "Shree Grocery Mart", price: 32, distanceKm: 0.6, isOpen: true, rating: 4.5 },
      { shopName: "Om Sai Kirana", price: 28, distanceKm: 1.4, isOpen: true, rating: 4.3 },
      { shopName: "Patel General Store", price: 24, distanceKm: 2.1, isOpen: false, rating: 4.1 },
    ],
  },
  {
    id: "v2",
    name: "Tomatoes 1kg",
    category: "Vegetables",
    rating: 4.4,
    supportsDelivery: true,
    supportsPickup: true,
    shops: [
      { shopName: "Om Sai Kirana", price: 28, distanceKm: 1.4, isOpen: true, rating: 4.3 },
      { shopName: "Shree Grocery Mart", price: 35, distanceKm: 0.6, isOpen: true, rating: 4.5 },
      { shopName: "Patel General Store", price: 30, distanceKm: 2.1, isOpen: false, rating: 4.1 },
    ],
  },
  {
    id: "v3",
    name: "Potatoes 1kg",
    category: "Vegetables",
    rating: 4.2,
    supportsDelivery: true,
    supportsPickup: true,
    shops: [
      { shopName: "Patel General Store", price: 24, distanceKm: 2.1, isOpen: false, rating: 4.1 },
      { shopName: "Shree Grocery Mart", price: 28, distanceKm: 0.6, isOpen: true, rating: 4.5 },
      { shopName: "Om Sai Kirana", price: 26, distanceKm: 1.4, isOpen: true, rating: 4.3 },
    ],
  },
  {
    id: "v4",
    name: "Spinach Bunch",
    category: "Vegetables",
    rating: 4.8,
    supportsDelivery: true,
    supportsPickup: true,
    shops: [
      { shopName: "Shree Grocery Mart", price: 18, distanceKm: 0.6, isOpen: true, rating: 4.5 },
      { shopName: "Om Sai Kirana", price: 20, distanceKm: 1.4, isOpen: true, rating: 4.3 },
    ],
  },
  {
    id: "f1",
    name: "Study Table",
    category: "Furniture",
    rating: 4.7,
    supportsDelivery: false,
    supportsPickup: true,
    shops: [
      { shopName: "Indore Furniture Hub", price: 3499, distanceKm: 3.2, isOpen: true, rating: 4.6 },
      { shopName: "Modern Home Store", price: 3800, distanceKm: 4.8, isOpen: true, rating: 4.4 },
    ],
  },
  {
    id: "f2",
    name: "Bookshelf 5-tier",
    category: "Furniture",
    rating: 4.5,
    supportsDelivery: false,
    supportsPickup: true,
    shops: [
      { shopName: "Modern Home Store", price: 2199, distanceKm: 4.8, isOpen: true, rating: 4.4 },
      { shopName: "Indore Furniture Hub", price: 2499, distanceKm: 3.2, isOpen: true, rating: 4.6 },
    ],
  },
  {
    id: "f3",
    name: "Office Chair",
    category: "Furniture",
    rating: 4.3,
    supportsDelivery: true,
    supportsPickup: true,
    shops: [
      { shopName: "Indore Furniture Hub", price: 4999, distanceKm: 3.2, isOpen: true, rating: 4.6 },
      { shopName: "Modern Home Store", price: 4500, distanceKm: 4.8, isOpen: false, rating: 4.4 },
    ],
  },
  {
    id: "e1",
    name: "Wireless Mouse",
    category: "Electronics",
    rating: 4.6,
    supportsDelivery: true,
    supportsPickup: true,
    shops: [
      { shopName: "Tech Point", price: 599, distanceKm: 1.9, isOpen: true, rating: 4.7 },
      { shopName: "Digital World", price: 649, distanceKm: 2.4, isOpen: true, rating: 4.5 },
      { shopName: "Prime Electronics", price: 549, distanceKm: 3.5, isOpen: true, rating: 4.2 },
    ],
  },
  {
    id: "e2",
    name: "Bluetooth Speaker",
    category: "Electronics",
    rating: 4.5,
    supportsDelivery: true,
    supportsPickup: true,
    shops: [
      { shopName: "Digital World", price: 1299, distanceKm: 2.4, isOpen: true, rating: 4.5 },
      { shopName: "Prime Electronics", price: 1199, distanceKm: 3.5, isOpen: true, rating: 4.2 },
      { shopName: "Tech Point", price: 1399, distanceKm: 1.9, isOpen: true, rating: 4.7 },
    ],
  },
  {
    id: "e3",
    name: "Power Bank 10000mAh",
    category: "Electronics",
    rating: 4.4,
    supportsDelivery: true,
    supportsPickup: true,
    shops: [
      { shopName: "Tech Point", price: 899, distanceKm: 1.9, isOpen: true, rating: 4.7 },
      { shopName: "Digital World", price: 999, distanceKm: 2.4, isOpen: true, rating: 4.5 },
    ],
  },
];

const nearbyShops = [
  { name: "Shree Grocery Mart", distanceKm: 0.6, isOpen: true, rating: 4.5, x: 120, y: 150 },
  { name: "Om Sai Kirana", distanceKm: 1.4, isOpen: true, rating: 4.3, x: 280, y: 80 },
  { name: "Tech Point", distanceKm: 1.9, isOpen: true, rating: 4.7, x: 220, y: 220 },
  { name: "Indore Furniture Hub", distanceKm: 3.2, isOpen: true, rating: 4.6, x: 420, y: 180 },
  { name: "Modern Home Store", distanceKm: 4.8, isOpen: true, rating: 4.4, x: 150, y: 350 },
  { name: "Patel General Store", distanceKm: 2.1, isOpen: false, rating: 4.1, x: 350, y: 310 },
];

const categories = ["All", "Vegetables", "Furniture", "Electronics"];

export default function HomePage({ themeMode, onToggleTheme, currentUser, onLogout, onNavigate, cart = [], onAddToCart }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState("delivery"); // delivery | pickup
  const [location, setLocation] = useState("Vijay Nagar, Indore");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Shop comparison details dialog
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Cart State
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Seller registration form state
  const [isShopRegOpen, setIsShopRegOpen] = useState(false);
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

  // Map interactive state
  const [hoveredShop, setHoveredShop] = useState(null);
  const [selectedShopOnMap, setSelectedShopOnMap] = useState(null);

  // Checkout Success State
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Transform raw mock data for rendering based on current shop states
  const processedProducts = useMemo(() => {
    return allProducts.map((p) => {
      // Find the best shop entry (lowest price among open shops, or cheapest shop overall if all closed)
      const openShops = p.shops.filter((s) => s.isOpen);
      const activeShops = openShops.length > 0 ? openShops : p.shops;
      const cheapestShopObj = activeShops.reduce((cheapest, current) => {
        return current.price < cheapest.price ? current : cheapest;
      }, activeShops[0]);

      return {
        ...p,
        price: cheapestShopObj.price,
        nearestShop: cheapestShopObj.shopName,
        distanceKm: cheapestShopObj.distanceKm,
        isOpen: cheapestShopObj.isOpen,
        shopCount: p.shops.length,
      };
    });
  }, []);

  // Filter products based on category and search query
  const filteredProducts = useMemo(() => {
    return processedProducts.filter((product) => {
      const matchCategory = selectedCategory === "All" || product.category === selectedCategory;
      const matchQuery =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [processedProducts, selectedCategory, searchQuery]);

  // Group products by category for horizontal display
  const vegetableProducts = filteredProducts.filter((p) => p.category === "Vegetables");
  const furnitureProducts = filteredProducts.filter((p) => p.category === "Furniture");
  const electronicsProducts = filteredProducts.filter((p) => p.category === "Electronics");

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

  // Seller registration form submission
  const handleShopRegSubmit = (e) => {
    e.preventDefault();
    if (regStep < 3) {
      setRegStep(regStep + 1);
    }
  };

  const handleCloseShopReg = () => {
    setIsShopRegOpen(false);
    setRegStep(1);
    setShopRegData({
      shopName: "",
      ownerName: "",
      category: "Grocery",
      phone: "",
      address: "",
      deliveryRadius: 3,
      supportsPickup: true,
    });
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", pb: 10 }}>
      {/* NAVBAR */}
      <Navbar
        location={location}
        mode={mode}
        onModeChange={setMode}
        cartCount={cartTotalQty}
        onCartToggle={() => setIsCartOpen(true)}
        themeMode={themeMode}
        onToggleTheme={onToggleTheme}
        onOpenShopReg={() => setIsShopRegOpen(true)}
        onLocationChange={setLocation}
        currentUser={currentUser}
        onLogout={onLogout}
        onNavigate={onNavigate}
      />

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
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Grid container spacing={4}>
          {/* LEFT SIDEBAR: MAP & DISCOVERY */}
          <Grid item xs={12} md={4} sx={{ order: { xs: 2, md: 1 } }}>
            {/* STATS BANNER */}
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                borderRadius: 4,
                mb: 3,
                background: themeMode === "dark" 
                  ? "linear-gradient(135deg, rgba(108, 93, 211, 0.1) 0%, rgba(22, 25, 37, 0.9) 100%)" 
                  : "linear-gradient(135deg, #F0EFFF 0%, #FFFFFF 100%)",
                border: "1px solid",
                borderColor: "primary.light",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                <TrendingUpIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={800}>
                  Shops open near you
                </Typography>
              </Stack>
              <Grid container spacing={2}>
                {nearbyShops.map((shop) => (
                  <Grid item xs={6} key={shop.name}>
                    <Paper
                      variant="outlined"
                      onMouseEnter={() => setHoveredShop(shop)}
                      onMouseLeave={() => setHoveredShop(null)}
                      onClick={() => setSelectedShopOnMap(shop)}
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        cursor: "pointer",
                        backgroundColor:
                          selectedShopOnMap?.name === shop.name
                            ? "rgba(108, 93, 211, 0.08)"
                            : "background.paper",
                        borderColor:
                          selectedShopOnMap?.name === shop.name
                            ? "primary.main"
                            : hoveredShop?.name === shop.name
                            ? "primary.light"
                            : "divider",
                        transform: hoveredShop?.name === shop.name ? "scale(1.03)" : "none",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Typography variant="body2" fontWeight={700} noWrap sx={{ color: "text.primary" }}>
                        {shop.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {shop.distanceKm} km · {shop.rating}★
                      </Typography>
                      <Chip
                        size="small"
                        label={shop.isOpen ? "Open" : "Closed"}
                        color={shop.isOpen ? "success" : "default"}
                        sx={{ height: 16, fontSize: "9px", mt: 0.5, fontWeight: 700 }}
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* MOCK MAP VIEW CARD */}
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 4,
                bgcolor: "background.paper",
                boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.02)",
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <MapOutlinedIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={800}>
                    Local Neighborhood Map
                  </Typography>
                </Stack>
                {selectedShopOnMap && (
                  <Button
                    size="small"
                    variant="text"
                    color="secondary"
                    onClick={() => setSelectedShopOnMap(null)}
                    sx={{ p: 0, minWidth: 0 }}
                  >
                    Clear route
                  </Button>
                )}
              </Stack>

              {/* VECTOR neighborhood map */}
              <Box
                sx={{
                  position: "relative",
                  height: 250,
                  borderRadius: 3,
                  overflow: "hidden",
                  bgcolor: themeMode === "dark" ? "#1e2235" : "#eef2f7",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <svg width="100%" height="100%" style={{ position: "absolute" }}>
                  {/* Grid lines symbolizing streets */}
                  <line x1="0" y1="50" x2="100%" y2="50" stroke={themeMode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeWidth="6" />
                  <line x1="0" y1="130" x2="100%" y2="130" stroke={themeMode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeWidth="8" />
                  <line x1="0" y1="200" x2="100%" y2="200" stroke={themeMode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeWidth="6" />
                  <line x1="100" y1="0" x2="100" y2="100%" stroke={themeMode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeWidth="8" />
                  <line x1="250" y1="0" x2="250" y2="100%" stroke={themeMode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeWidth="6" />
                  <line x1="380" y1="0" x2="380" y2="100%" stroke={themeMode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeWidth="8" />

                  {/* Route draw if shop is selected */}
                  {selectedShopOnMap && (
                    <path
                      d={`M 200 120 L ${selectedShopOnMap.x} ${selectedShopOnMap.y}`}
                      fill="none"
                      stroke="#FF7551"
                      strokeWidth="3"
                      strokeDasharray="5,5"
                      style={{ animation: "dash 1.5s linear infinite" }}
                    />
                  )}

                  {/* User Pin */}
                  <circle cx="200" cy="120" r="10" fill="#6C5DD3" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx="200" cy="120" r="4" fill="#FFFFFF" />
                </svg>

                {/* Map Labels/Pins */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 125,
                    left: 205,
                    bgcolor: "primary.main",
                    color: "#FFFFFF",
                    fontSize: 9,
                    fontWeight: 700,
                    px: 0.5,
                    borderRadius: 1,
                  }}
                >
                  YOU (Indore)
                </Box>

                {nearbyShops.map((shop) => (
                  <Box
                    key={shop.name}
                    onMouseEnter={() => setHoveredShop(shop)}
                    onMouseLeave={() => setHoveredShop(null)}
                    onClick={() => setSelectedShopOnMap(shop)}
                    sx={{
                      position: "absolute",
                      left: shop.x - 8,
                      top: shop.y - 16,
                      cursor: "pointer",
                      zIndex: hoveredShop?.name === shop.name || selectedShopOnMap?.name === shop.name ? 5 : 2,
                    }}
                  >
                    <PlaceIcon
                      sx={{
                        color:
                          selectedShopOnMap?.name === shop.name
                            ? "secondary.main"
                            : hoveredShop?.name === shop.name
                            ? "primary.main"
                            : shop.isOpen
                            ? "success.main"
                            : "text.disabled",
                        fontSize: hoveredShop?.name === shop.name ? 26 : 22,
                        filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.2))",
                        transition: "all 0.2s ease",
                      }}
                    />
                    {(hoveredShop?.name === shop.name || selectedShopOnMap?.name === shop.name) && (
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 24,
                          left: "50%",
                          transform: "translateX(-50%)",
                          bgcolor: "background.paper",
                          color: "text.primary",
                          boxShadow: 3,
                          borderRadius: 1.5,
                          p: 0.75,
                          width: 130,
                          fontSize: 9,
                          fontWeight: 700,
                          border: "1px solid",
                          borderColor: "primary.main",
                        }}
                      >
                        <div style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                          {shop.name}
                        </div>
                        <div style={{ color: "#FF7551" }}>Distance: {shop.distanceKm} km</div>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>

              {/* Map Footer Route Details */}
              {selectedShopOnMap && (
                <Alert
                  severity="info"
                  icon={<NavigationOutlinedIcon />}
                  sx={{ mt: 2, borderRadius: 2.5, "& .MuiAlert-message": { width: "100%" } }}
                >
                  <Typography variant="caption" fontWeight={700} display="block">
                    Route to {selectedShopOnMap.name}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    Delivery ETA: <strong>{Math.round(10 + selectedShopOnMap.distanceKm * 5)} mins</strong> (Pickup:{" "}
                    <strong>{Math.round(5 + selectedShopOnMap.distanceKm * 3)} mins travel</strong>)
                  </Typography>
                </Alert>
              )}
            </Paper>
          </Grid>

          {/* RIGHT MAIN AREA: CATEGORY CHIPS & PRODUCT LIST */}
          <Grid item xs={12} md={8} sx={{ order: { xs: 1, md: 2 } }}>
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
            {searchQuery && filteredProducts.length === 0 ? (
              <Paper sx={{ p: 5, textAlign: "center", borderRadius: 4 }}>
                <Typography variant="h6" fontWeight={700} color="text.secondary">
                  No products found matching "{searchQuery}"
                </Typography>
                <Button variant="outlined" color="primary" sx={{ mt: 2 }} onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              </Paper>
            ) : (
              <>
                {/* FRESH VEGETABLES ROW */}
                {(selectedCategory === "All" || selectedCategory === "Vegetables") && (
                  <CategorySection
                    title="🥬 Fresh Vegetables"
                    subtitle="Direct from nearby farms & local grocery stores"
                    products={vegetableProducts}
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
                    products={furnitureProducts}
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
                    products={electronicsProducts}
                    onAddToCart={handleAddToCart}
                    onProductClick={(p) => navigate(`/product/${p.id}`)}
                    mode={mode}
                    onSeeAll={() => setSelectedCategory("Electronics")}
                  />
                )}
              </>
            )}
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

      {/* SHOP REGISTRATION MODAL */}
      <Dialog
        open={isShopRegOpen}
        onClose={handleCloseShopReg}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, p: 1 },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <StorefrontIcon color="primary" />
            <Typography variant="h5" fontWeight={800}>
              Register Shop on LocalMart
            </Typography>
          </Box>
          <IconButton onClick={handleCloseShopReg}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleShopRegSubmit}>
          <DialogContent dividers sx={{ px: 3, py: 3 }}>
            {/* Steps tracker */}
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 4 }}>
              <Chip label="1. Basic Info" color={regStep >= 1 ? "primary" : "default"} sx={{ fontWeight: 700 }} />
              <Chip label="2. Delivery & Address" color={regStep >= 2 ? "primary" : "default"} sx={{ fontWeight: 700 }} />
              <Chip label="3. Complete" color={regStep >= 3 ? "primary" : "default"} sx={{ fontWeight: 700 }} />
            </Stack>

            {regStep === 1 && (
              <Stack spacing={2.5}>
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
              <Stack spacing={2.5}>
                <TextField
                  label="Shop Address"
                  fullWidth
                  required
                  multiline
                  rows={2}
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
              <Box sx={{ textAlign: "center", py: 3 }}>
                <Avatar sx={{ bgcolor: "success.main", width: 64, height: 64, mx: "auto", mb: 2 }}>
                  <DoneIcon sx={{ fontSize: 36, color: "#FFFFFF" }} />
                </Avatar>
                <Typography variant="h6" fontWeight={800} gutterBottom>
                  Application Submitted Successfully!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Our team will verify your local shop details and contact you at{" "}
                  <strong>{shopRegData.phone}</strong> within 24 hours to go live!
                </Typography>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2.5 }}>
            {regStep < 3 ? (
              <>
                {regStep > 1 && (
                  <Button variant="outlined" onClick={() => setRegStep(regStep - 1)}>
                    Back
                  </Button>
                )}
                <Button type="submit" variant="contained">
                  Next Step
                </Button>
              </>
            ) : (
              <Button variant="contained" onClick={handleCloseShopReg} fullWidth>
                Close Portal
              </Button>
            )}
          </DialogActions>
        </form>
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