import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  Chip,
  Stack,
  Rating,
  Divider,
  Alert,
  IconButton,
  Avatar,
  useTheme,
  Radio
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as LocalShippingIcon,
  Storefront as StorefrontIcon,
  CheckCircle as CheckCircleIcon,
  Store as StoreIcon,
  FlashOn as FlashOnIcon,
  FavoriteBorder as FavoriteBorderIcon,
  LocalOffer as LocalOfferIcon
} from "@mui/icons-material";

// Rich Mock Catalog matching products
const sampleProducts = [
  {
    id: "v1",
    name: "Onions 1kg",
    brand: "Fresh Farm Produce",
    category: "Vegetables",
    rating: 4.6,
    stockAvailable: 150,
    about: "Farm fresh A-grade red onions directly sourced from local farmers. Perfect for daily cooking, curries, and salads with high nutritional value and crisp texture.",
    supportsDelivery: true,
    supportsPickup: true,
    shops: [
      { shopName: "Shree Grocery Mart", price: 32, distanceKm: 0.6, isOpen: true, rating: 4.5, address: "Vijay Nagar Main Rd" },
      { shopName: "Om Sai Kirana", price: 28, distanceKm: 1.4, isOpen: true, rating: 4.3, address: "Scheme 54, Indore" },
      { shopName: "Patel General Store", price: 24, distanceKm: 2.1, isOpen: false, rating: 4.1, address: "AB Road, Indore" },
    ],
  },
  {
    id: "v2",
    name: "Tomatoes 1kg",
    brand: "Organica Local",
    category: "Vegetables",
    rating: 4.4,
    stockAvailable: 90,
    about: "Juicy, naturally ripened red tomatoes. Rich in Vitamin C and antioxidants. Great for gravies, soups, and daily Indian dishes.",
    supportsDelivery: true,
    supportsPickup: true,
    shops: [
      { shopName: "Om Sai Kirana", price: 28, distanceKm: 1.4, isOpen: true, rating: 4.3, address: "Scheme 54, Indore" },
      { shopName: "Shree Grocery Mart", price: 35, distanceKm: 0.6, isOpen: true, rating: 4.5, address: "Vijay Nagar Main Rd" },
    ],
  },
  {
    id: "f1",
    name: "Ergonomic Office Chair",
    brand: "UrbanWood Furniture",
    category: "Furniture",
    rating: 4.8,
    stockAvailable: 12,
    about: "High-back mesh ergonomic office chair with adjustable armrests and lumbar support. Designed for prolonged comfortable posture during work.",
    supportsDelivery: true,
    supportsPickup: true,
    shops: [
      { shopName: "Malwa Furniture Hub", price: 4499, distanceKm: 1.2, isOpen: true, rating: 4.8, address: "Palasia Square, Indore" },
      { shopName: "WoodCraft Studios", price: 4799, distanceKm: 2.8, isOpen: true, rating: 4.6, address: "Bhawarkua, Indore" },
    ],
  },
];

export default function ProductDetailPage({ onAddToCart, themeMode }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();

  // Find product or fallback to first sample
  const product = sampleProducts.find((p) => p.id === id) || sampleProducts[0];
  const [selectedShop, setSelectedShop] = useState(product.shops[0]);
  const [addedAlert, setAddedAlert] = useState("");

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart(product, "delivery", selectedShop);
      setAddedAlert(`Added "${product.name}" from ${selectedShop.shopName} to cart!`);
      setTimeout(() => setAddedAlert(""), 3000);
    }
  };

  const handleBuyNow = () => {
    if (onAddToCart) {
      onAddToCart(product, "delivery", selectedShop);
      navigate("/cart");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4, px: { xs: 2, md: 4 } }}>
      <Container maxWidth="lg">
        {/* Header Navigation */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton 
              onClick={() => navigate("/")} 
              sx={{ bgcolor: "background.paper", boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
                Product Details
              </Typography>
            </Box>
          </Stack>
          <IconButton sx={{ bgcolor: "background.paper", boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <FavoriteBorderIcon />
          </IconButton>
        </Stack>

        {addedAlert && (
          <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3, borderRadius: 3, fontWeight: 'bold' }}>
            {addedAlert}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Picture of Product */}
          <Grid item xs={12} md={5}>
            <Box sx={{ position: 'relative' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 5,
                  border: "1px solid",
                  borderColor: "divider",
                  textAlign: "center",
                  background: themeMode === "dark"
                      ? "linear-gradient(135deg, #262b42 0%, #171925 100%)"
                      : "linear-gradient(135deg, #ffffff 0%, #f0f2f5 100%)",
                  position: "relative",
                  height: { xs: 350, md: 450 },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  boxShadow: themeMode === "dark" ? '0 10px 40px rgba(0,0,0,0.3)' : '0 10px 40px rgba(0,0,0,0.03)',
                  mb: 2,
                  overflow: 'hidden'
                }}
              >
                {/* Floating Tags */}
                <Box sx={{ position: "absolute", top: 20, left: 20, display: 'flex', gap: 1 }}>
                  <Chip
                    label={product.category}
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 800, borderRadius: 2, px: 1, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                  />
                </Box>
                
                {/* Floating Actions */}
                <Box sx={{ position: "absolute", top: 20, right: 20, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <IconButton size="small" sx={{ bgcolor: 'background.paper', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', '&:hover': { bgcolor: 'primary.50' } }}>
                    <FavoriteBorderIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" sx={{ bgcolor: 'background.paper', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', '&:hover': { bgcolor: 'primary.50' } }}>
                    <Box component="span" sx={{ fontSize: 16 }}>🔗</Box>
                  </IconButton>
                </Box>

                {/* Main Product Image (Emoji Placeholder) */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: { xs: 120, md: 160 },
                    filter: themeMode === "dark" ? 'drop-shadow(0px 30px 40px rgba(0,0,0,0.4))' : 'drop-shadow(0px 30px 40px rgba(0,0,0,0.15))',
                    transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    '&:hover': { transform: 'scale(1.1) rotate(-5deg)' }
                  }}
                >
                  {product.category === "Furniture" ? "🛋️" : product.category === "Vegetables" ? "🥬" : "🛒"}
                </Box>

                {/* Delivery Badges */}
                <Stack direction="row" justifyContent="center" spacing={1} sx={{ position: "absolute", bottom: 20, left: 0, right: 0 }}>
                  <Chip icon={<LocalShippingIcon fontSize="small" />} label="Hyperlocal" size="small" sx={{ borderRadius: 1.5, bgcolor: 'background.paper', fontWeight: 800, color: 'text.primary', border: '1px solid', borderColor: 'divider' }} />
                  <Chip icon={<StorefrontIcon fontSize="small" />} label="Pickup" size="small" sx={{ borderRadius: 1.5, bgcolor: 'background.paper', fontWeight: 800, color: 'text.primary', border: '1px solid', borderColor: 'divider' }} />
                </Stack>
              </Paper>

              {/* Thumbnail Gallery */}
              <Stack direction="row" spacing={2} justifyContent="center">
                {[1, 2, 3].map((item, idx) => (
                  <Paper
                    key={idx}
                    elevation={0}
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: 3,
                      border: '2px solid',
                      borderColor: idx === 0 ? 'primary.main' : 'divider',
                      bgcolor: idx === 0 ? 'primary.50' : (themeMode === 'dark' ? 'rgba(255,255,255,0.02)' : 'grey.50'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Box sx={{ fontSize: 28, opacity: idx === 0 ? 1 : 0.6 }}>
                      {product.category === "Furniture" ? "🛋️" : product.category === "Vegetables" ? "🥬" : "🛒"}
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </Box>
          </Grid>

          {/* Product Specifications & Sellers */}
          <Grid item xs={12} md={7}>
            <Box sx={{ p: { xs: 0, md: 2 } }}>
              <Typography variant="overline" sx={{ fontWeight: 800, color: "primary.main", letterSpacing: 1.5 }}>
                {product.brand}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, mt: 0.5, mb: 1.5, letterSpacing: -1, lineHeight: 1.2 }}>
                {product.name}
              </Typography>

              <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 3 }}>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ bgcolor: 'warning.50', px: 1.5, py: 0.5, borderRadius: 2 }}>
                  <Rating value={product.rating} precision={0.1} readOnly size="small" sx={{ color: 'warning.main' }} />
                  <Typography variant="body2" sx={{ fontWeight: 800, color: 'warning.dark' }}>
                    {product.rating}
                  </Typography>
                </Stack>
                <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckCircleIcon fontSize="small" /> {product.stockAvailable} in stock
                </Typography>
              </Stack>

              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, fontSize: '1.05rem', mb: 4 }}>
                {product.about}
              </Typography>

              <Divider sx={{ mb: 3 }} />

              {/* Added Rich Content: Offers & Highlights to fill the page */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'success.50', border: '1px dashed', borderColor: 'success.main' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'success.dark', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocalOfferIcon fontSize="small" /> Available Offers
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: 'text.primary', fontWeight: 500 }}>
                      • <strong>Bank Offer:</strong> 10% off on HDFC Credit Cards.
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: 'text.primary', fontWeight: 500 }}>
                      • <strong>Promo:</strong> Use LOCAL10 for 10% discount.
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', color: 'primary.main', fontWeight: 700, cursor: 'pointer' }}>
                      + 2 more offers
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider', height: '100%' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                      Product Highlights
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontWeight: 500 }}>
                        <CheckCircleIcon color="success" sx={{ fontSize: 14 }} /> 100% Genuine Quality
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontWeight: 500 }}>
                        <CheckCircleIcon color="success" sx={{ fontSize: 14 }} /> Easy Returns Policy
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontWeight: 500 }}>
                        <CheckCircleIcon color="success" sx={{ fontSize: 14 }} /> Secure Checkout
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ mb: 4 }} />

              {/* Sellers Section - Redesigned as Modern List */}
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                Available at Nearby Stores
              </Typography>
              
              <Stack spacing={2} sx={{ mb: 4 }}>
                {product.shops.map((shop, idx) => {
                  const isSelected = selectedShop.shopName === shop.shopName;
                  return (
                    <Paper
                      key={idx}
                      elevation={0}
                      onClick={() => setSelectedShop(shop)}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        border: '2px solid',
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        bgcolor: isSelected ? 'primary.50' : 'background.paper',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        '&:hover': {
                          borderColor: isSelected ? 'primary.main' : 'primary.light',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Radio 
                          checked={isSelected}
                          onChange={() => setSelectedShop(shop)}
                          color="primary"
                          sx={{ p: 0 }}
                        />
                        <Avatar sx={{ bgcolor: isSelected ? 'primary.main' : 'grey.200', color: isSelected ? 'white' : 'grey.600', borderRadius: 2 }}>
                          <StoreIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: isSelected ? 'primary.dark' : 'text.primary' }}>
                            {shop.shopName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 500 }}>
                            {shop.distanceKm} km away • {shop.address}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: isSelected ? 'primary.main' : 'text.primary' }}>
                          ₹{shop.price}
                        </Typography>
                        {!shop.isOpen && (
                          <Chip label="Closed Now" size="small" color="error" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }} />
                        )}
                      </Box>
                    </Paper>
                  );
                })}
              </Stack>

              {/* Actions */}
              <Box sx={{ position: { xs: 'fixed', md: 'static' }, bottom: 0, left: 0, right: 0, p: { xs: 2, md: 0 }, bgcolor: 'background.paper', borderTop: { xs: '1px solid', md: 'none' }, borderColor: 'divider', zIndex: 10 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    size="large"
                    startIcon={<ShoppingCartIcon />}
                    onClick={handleAdd}
                    disabled={!selectedShop.isOpen}
                    sx={{ py: 1.8, borderRadius: 3, fontWeight: 800, fontSize: '1.05rem', borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                  >
                    Add To Cart
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    startIcon={<FlashOnIcon />}
                    onClick={handleBuyNow}
                    disabled={!selectedShop.isOpen}
                    sx={{
                      py: 1.8,
                      borderRadius: 3,
                      fontWeight: 800,
                      fontSize: '1.05rem',
                      background: "linear-gradient(135deg, #FF7551 0%, #FF5252 100%)",
                      boxShadow: '0 8px 20px rgba(255, 82, 82, 0.3)',
                      '&:hover': {
                        background: "linear-gradient(135deg, #FF5252 0%, #D50000 100%)",
                      }
                    }}
                  >
                    Buy Now for ₹{selectedShop.price}
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
