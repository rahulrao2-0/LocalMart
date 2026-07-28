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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as LocalShippingIcon,
  Storefront as StorefrontIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  Store as StoreIcon,
  FlashOn as FlashOnIcon,
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
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <IconButton onClick={() => navigate("/")} sx={{ bgcolor: "background.paper", boxShadow: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Product Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Detailed specifications and available nearby shop sellers
            </Typography>
          </Box>
        </Stack>

        {addedAlert && (
          <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3, borderRadius: 3 }}>
            {addedAlert}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Picture of Product */}
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 5,
                border: "1px solid",
                borderColor: "divider",
                textAlign: "center",
                background:
                  themeMode === "dark"
                    ? "linear-gradient(135deg, #1e2235 0%, #171925 100%)"
                    : "linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)",
                position: "relative",
              }}
            >
              <Chip
                label={product.category}
                color="primary"
                size="small"
                sx={{ position: "absolute", top: 16, left: 16, fontWeight: 700, borderRadius: 2 }}
              />

              <Box
                sx={{
                  height: 260,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 100,
                  my: 3,
                }}
              >
                {product.category === "Furniture" ? "🛋️" : product.category === "Vegetables" ? "🥬" : "🛒"}
              </Box>

              <Stack direction="row" justifyContent="center" spacing={1}>
                <Chip
                  icon={<LocalShippingIcon />}
                  label="Hyperlocal Delivery"
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                />
                <Chip
                  icon={<StorefrontIcon />}
                  label="In-Store Pickup"
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                />
              </Stack>
            </Paper>
          </Grid>

          {/* Product Specifications & Sellers */}
          <Grid item xs={12} md={7}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 5,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              {/* Brand & Name */}
              <Typography variant="overline" fontWeight={800} color="primary" letterSpacing={1.2}>
                Brand: {product.brand}
              </Typography>
              <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, mb: 1 }}>
                {product.name}
              </Typography>

              {/* Rating & Stock */}
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Rating value={product.rating} precision={0.1} readOnly size="small" />
                  <Typography variant="body2" fontWeight={700}>
                    {product.rating}
                  </Typography>
                </Stack>

                <Chip
                  label={`${product.stockAvailable} units in stock`}
                  color={product.stockAvailable > 20 ? "success" : "warning"}
                  size="small"
                  sx={{ fontWeight: 700, borderRadius: 2 }}
                />
              </Stack>

              <Divider sx={{ my: 2 }} />

              {/* About Product */}
              <Typography variant="h6" fontWeight={700} gutterBottom>
                About Product
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.7 }}>
                {product.about}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Available Shops / Sellers */}
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Choose Local Shop Seller
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Shop</TableCell>
                      <TableCell align="center">Distance</TableCell>
                      <TableCell align="center">Price</TableCell>
                      <TableCell align="right">Select</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {product.shops.map((shop, idx) => (
                      <TableRow key={idx} selected={selectedShop.shopName === shop.shopName}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            {shop.shopName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {shop.address}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">{shop.distanceKm} km</TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight={800} color="primary.main">
                            ₹{shop.price}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant={selectedShop.shopName === shop.shopName ? "contained" : "outlined"}
                            onClick={() => setSelectedShop(shop)}
                            sx={{ borderRadius: 2, fontSize: 11 }}
                          >
                            {selectedShop.shopName === shop.shopName ? "Selected" : "Choose"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Order & Add to Cart Action Buttons */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  size="large"
                  startIcon={<ShoppingCartIcon />}
                  onClick={handleAdd}
                  sx={{ py: 1.4, borderRadius: 3, fontWeight: 700 }}
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
                  sx={{
                    py: 1.4,
                    borderRadius: 3,
                    fontWeight: 800,
                    background: "linear-gradient(135deg, #FF7551 0%, #FF5252 100%)",
                  }}
                >
                  Order Now (₹{selectedShop.price})
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
