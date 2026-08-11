import React, { useState, useEffect } from "react";
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
  Radio,
  Skeleton,
  Fade
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
  LocalOffer as LocalOfferIcon,
  Verified as VerifiedIcon,
  Share as ShareIcon,
  Error as ErrorOutlineIcon
} from "@mui/icons-material";
import { fetchProductById } from "../services/productApi.js";

export default function ProductDetailPage({ onAddToCart, themeMode }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedShop, setSelectedShop] = useState(null);
  const [addedAlert, setAddedAlert] = useState("");
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const response = await fetchProductById(id);
        if (response && response.success && response.data) {
          const data = response.data;
          // Map backend product to frontend structure
          const shopName = data.brand || "Local Premium Seller";
          const price = data.price;
          const isOpen = data.status !== "INACTIVE";
          const distanceKm = Math.floor(Math.random() * 4) + 1;

          const sellerId = data.sellerId || data.seller_id || "seller-001";

          const mappedProduct = {
            id: data._id,
            sellerId: sellerId,
            name: data.name,
            category: data.category || "General",
            rating: data.rating || 4.7,
            supportsDelivery: true,
            supportsPickup: true,
            price: price,
            nearestShop: shopName,
            distanceKm: distanceKm,
            isOpen: isOpen,
            shopCount: 1,
            shops: [{ shopName, price, distanceKm, isOpen, rating: 4.8, address: "City Center Hub", sellerId: sellerId }],
            images: data.images && data.images.length > 0 ? data.images : [],
            about: data.description || "Discover premium quality with this locally sourced item. Built to last and sourced directly from nearby vendors to ensure you get the best value and authenticity.",
            stockAvailable: data.stockAvailable || 10,
            brand: data.brand || "LocalMart Signature",
            weight: data.weight || "",
          };

          setProduct(mappedProduct);
          setSelectedShop(mappedProduct.shops[0]);
        } else {
          setError("Product not found or unavailable.");
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        setError("Failed to fetch product details. Please try again later.");
      }
      setLoading(false);
    };

    fetchProductDetails();
  }, [id]);

  const handleAdd = () => {
    if (onAddToCart && product && selectedShop) {
      onAddToCart(product, "delivery", selectedShop);
      setAddedAlert(`Added "${product.name}" to your cart!`);
      setTimeout(() => setAddedAlert(""), 3000);
    }
  };

  const handleBuyNow = () => {
    if (onAddToCart && product && selectedShop) {
      onAddToCart(product, "delivery", selectedShop);
      navigate("/cart");
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="text" width={200} height={40} />
        </Stack>
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Skeleton variant="rounded" height={450} sx={{ borderRadius: 5 }} />
            <Stack direction="row" spacing={2} sx={{ mt: 2 }} justifyContent="center">
              <Skeleton variant="rounded" width={70} height={70} sx={{ borderRadius: 3 }} />
              <Skeleton variant="rounded" width={70} height={70} sx={{ borderRadius: 3 }} />
              <Skeleton variant="rounded" width={70} height={70} sx={{ borderRadius: 3 }} />
            </Stack>
          </Grid>
          <Grid item xs={12} md={7}>
            <Skeleton variant="text" width={100} height={20} />
            <Skeleton variant="text" width="80%" height={60} />
            <Skeleton variant="text" width="40%" height={30} sx={{ mb: 3 }} />
            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2, mb: 4 }} />
            <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 3 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: "center" }}>
        <ErrorOutlineIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
        <Typography variant="h4" fontWeight={800} gutterBottom>Oops!</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>{error}</Typography>
        <Button variant="contained" onClick={() => navigate(-1)} sx={{ borderRadius: 3, px: 4 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  // Generate an emoji based on category for placeholder images
  const getCategoryEmoji = (cat) => {
    if (cat === "Furniture") return "🛋️";
    if (cat === "Vegetables") return "🥬";
    if (cat === "Electronics") return "💻";
    if (cat === "Clothing") return "👕";
    return "🛍️";
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: { xs: 2, md: 5 }, px: { xs: 1, md: 4 } }}>
      <Container maxWidth="lg">
        {/* Header Navigation - Glassmorphism style */}
        <Stack 
          direction="row" 
          alignItems="center" 
          justifyContent="space-between" 
          sx={{ 
            mb: 4, 
            position: 'sticky', 
            top: 20, 
            zIndex: 100,
            backdropFilter: 'blur(12px)',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(18, 18, 18, 0.7)' : 'rgba(255, 255, 255, 0.7)',
            p: 1.5,
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton 
              onClick={() => navigate(-1)} 
              sx={{ 
                bgcolor: "background.paper", 
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                '&:hover': { transform: 'scale(1.05)', transition: '0.2s' }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.5, display: { xs: 'none', sm: 'block' } }}>
              Back to Shopping
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <IconButton sx={{ bgcolor: "background.paper", boxShadow: '0 4px 12px rgba(0,0,0,0.08)', '&:hover': { color: 'primary.main' } }}>
              <ShareIcon fontSize="small" />
            </IconButton>
            <IconButton sx={{ bgcolor: "background.paper", boxShadow: '0 4px 12px rgba(0,0,0,0.08)', color: 'error.main', '&:hover': { transform: 'scale(1.1)' } }}>
              <FavoriteBorderIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>

        <Fade in timeout={500}>
          <Box>
            {addedAlert && (
              <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3, borderRadius: 3, fontWeight: 'bold', boxShadow: '0 4px 20px rgba(76, 175, 80, 0.15)' }}>
                {addedAlert}
              </Alert>
            )}

            <Grid container spacing={5}>
              {/* Picture of Product */}
              <Grid item xs={12} md={5.5}>
                <Box sx={{ position: 'sticky', top: 100 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 6,
                      textAlign: "center",
                      background: theme.palette.mode === "dark"
                          ? "linear-gradient(135deg, #1E1E2D 0%, #151521 100%)"
                          : "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
                      position: "relative",
                      height: { xs: 350, md: 500 },
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      boxShadow: theme.palette.mode === "dark" ? 'inset 0 0 0 1px rgba(255,255,255,0.05), 0 20px 40px rgba(0,0,0,0.2)' : 'inset 0 0 0 1px rgba(0,0,0,0.05), 0 20px 40px rgba(0,0,0,0.06)',
                      mb: 3,
                      overflow: 'hidden',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {/* Floating Tags */}
                    <Box sx={{ position: "absolute", top: 20, left: 20 }}>
                      <Chip
                        label={product.category}
                        color="primary"
                        size="medium"
                        sx={{ fontWeight: 800, borderRadius: 2, px: 1, boxShadow: '0 4px 15px rgba(108, 93, 211, 0.3)' }}
                      />
                    </Box>
                    
                    {/* Main Product Visual */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "100%",
                        fontSize: { xs: 120, md: 180 },
                        filter: product.images && product.images.length > 0 ? "none" : (theme.palette.mode === "dark" ? 'drop-shadow(0px 30px 40px rgba(0,0,0,0.5))' : 'drop-shadow(0px 30px 40px rgba(0,0,0,0.15))'),
                        transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        '&:hover': { transform: product.images && product.images.length > 0 ? 'scale(1.03)' : 'scale(1.08) rotate(-3deg)' }
                      }}
                    >
                      {product.images && product.images.length > 0 && product.images[activeImageIdx] ? (
                        <Box component="img" src={product.images[activeImageIdx].url} alt={product.name} sx={{ width: '100%', height: '100%', maxHeight: { xs: 250, md: 380 }, objectFit: 'cover', borderRadius: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }} />
                      ) : (
                        getCategoryEmoji(product.category)
                      )}
                    </Box>
                  </Paper>

                  {/* Thumbnail Gallery */}
                  <Stack direction="row" spacing={2} justifyContent="center">
                    {(product.images && product.images.length > 0 ? product.images : [0, 1, 2]).map((item, idx) => (
                      <Paper
                        key={idx}
                        elevation={0}
                        onClick={() => setActiveImageIdx(idx)}
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: 4,
                          border: '2px solid',
                          borderColor: activeImageIdx === idx ? 'primary.main' : 'divider',
                          bgcolor: activeImageIdx === idx ? 'primary.50' : 'background.paper',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: activeImageIdx === idx ? '0 8px 20px rgba(108, 93, 211, 0.15)' : 'none',
                          '&:hover': {
                            borderColor: 'primary.main',
                            transform: 'translateY(-4px)'
                          }
                        }}
                      >
                        <Box sx={{ fontSize: 32, opacity: activeImageIdx === idx ? 1 : 0.5 }}>
                          {product.images && product.images[idx] ? (
                            <Box component="img" src={product.images[idx].url} sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 3 }} />
                          ) : (
                            getCategoryEmoji(product.category)
                          )}
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              </Grid>

              {/* Product Specifications & Sellers */}
              <Grid item xs={12} md={6.5}>
                <Box sx={{ p: { xs: 0, md: 2 } }}>
                  <Typography variant="overline" sx={{ fontWeight: 800, color: "primary.main", letterSpacing: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <VerifiedIcon fontSize="small" /> {product.brand} {product.weight ? `• ${product.weight}` : ''}
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, mt: 1, mb: 2, letterSpacing: -1, lineHeight: 1.1 }}>
                    {product.name}
                  </Typography>

                  <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 4 }}>
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ bgcolor: 'warning.50', px: 2, py: 0.75, borderRadius: 3 }}>
                      <Rating value={product.rating} precision={0.1} readOnly size="small" sx={{ color: 'warning.main' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'warning.dark', ml: 1 }}>
                        {product.rating}
                      </Typography>
                    </Stack>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: product.stockAvailable > 0 ? 'success.main' : 'error.main', display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: product.stockAvailable > 0 ? 'success.50' : 'error.50', px: 2, py: 0.75, borderRadius: 3 }}>
                      {product.stockAvailable > 0 ? <><CheckCircleIcon fontSize="small" /> {product.stockAvailable} In Stock</> : <><ErrorOutlineIcon fontSize="small" /> Out of Stock</>}
                    </Typography>
                  </Stack>

                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, fontSize: '1.1rem', mb: 4, letterSpacing: 0.2 }}>
                    {product.about}
                  </Typography>

                  <Divider sx={{ mb: 4, opacity: 0.6 }} />

                  {/* Rich Features Block */}
                  <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2.5, borderRadius: 4, bgcolor: theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.05)' : 'success.50', border: '1px dashed', borderColor: 'success.main' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'success.dark', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <LocalOfferIcon fontSize="small" /> Bank & Promo Offers
                        </Typography>
                        <Stack spacing={1}>
                          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary', fontWeight: 600 }}>
                            <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }} /> 10% instant discount on HDFC
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary', fontWeight: 600 }}>
                            <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }} /> Use LOCAL10 for cashback
                          </Typography>
                        </Stack>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2.5, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', height: '100%', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                          Why Buy Here?
                        </Typography>
                        <Stack spacing={1}>
                          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontWeight: 600 }}>
                            <LocalShippingIcon color="primary" sx={{ fontSize: 16 }} /> Hyperlocal Delivery in 30 mins
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontWeight: 600 }}>
                            <StorefrontIcon color="primary" sx={{ fontSize: 16 }} /> Verified Neighborhood Sellers
                          </Typography>
                        </Stack>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Sellers List */}
                  <Typography variant="h6" sx={{ fontWeight: 900, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StoreIcon color="primary" /> Available at Nearby Stores
                  </Typography>
                  
                  <Stack spacing={2} sx={{ mb: 6 }}>
                    {product.shops.map((shop, idx) => {
                      const isSelected = selectedShop && selectedShop.shopName === shop.shopName;
                      return (
                        <Paper
                          key={idx}
                          elevation={0}
                          onClick={() => setSelectedShop(shop)}
                          sx={{
                            p: { xs: 2, sm: 3 },
                            borderRadius: 4,
                            border: '2px solid',
                            borderColor: isSelected ? 'primary.main' : 'divider',
                            bgcolor: isSelected ? 'primary.50' : 'background.paper',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            '&:hover': {
                              borderColor: isSelected ? 'primary.main' : 'primary.light',
                              transform: 'translateY(-3px)',
                              boxShadow: '0 12px 30px rgba(0,0,0,0.06)'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                            <Radio checked={isSelected} color="primary" sx={{ p: 0, display: { xs: 'none', sm: 'block' } }} />
                            <Avatar sx={{ width: 50, height: 50, bgcolor: isSelected ? 'primary.main' : 'grey.200', color: isSelected ? 'white' : 'grey.600', borderRadius: 3, boxShadow: isSelected ? '0 4px 12px rgba(108, 93, 211, 0.3)' : 'none' }}>
                              <StorefrontIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: isSelected ? 'primary.dark' : 'text.primary', fontSize: '1.1rem' }}>
                                {shop.shopName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}>
                                {shop.distanceKm} km away • {shop.address}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: isSelected ? 'primary.main' : 'text.primary', letterSpacing: -1 }}>
                              ₹{shop.price}
                            </Typography>
                            {!shop.isOpen && (
                              <Chip label="Closed Now" size="small" color="error" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 800, mt: 0.5 }} />
                            )}
                          </Box>
                        </Paper>
                      );
                    })}
                  </Stack>

                  {/* Call to Action Floating Bar */}
                  <Box sx={{ 
                    position: { xs: 'fixed', md: 'static' }, 
                    bottom: 0, left: 0, right: 0, 
                    p: { xs: 2.5, md: 0 }, 
                    bgcolor: { xs: 'background.paper', md: 'transparent' }, 
                    borderTop: { xs: '1px solid', md: 'none' }, 
                    borderColor: 'divider', 
                    zIndex: 10,
                    boxShadow: { xs: '0 -10px 30px rgba(0,0,0,0.05)', md: 'none' }
                  }}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      <Button
                        variant="outlined"
                        color="primary"
                        fullWidth
                        size="large"
                        startIcon={<ShoppingCartIcon />}
                        onClick={handleAdd}
                        disabled={!selectedShop || !selectedShop.isOpen || product.stockAvailable === 0}
                        sx={{ py: 2, borderRadius: 4, fontWeight: 800, fontSize: '1.1rem', borderWidth: 2, '&:hover': { borderWidth: 2, bgcolor: 'primary.50' } }}
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
                        disabled={!selectedShop || !selectedShop.isOpen || product.stockAvailable === 0}
                        sx={{
                          py: 2,
                          borderRadius: 4,
                          fontWeight: 800,
                          fontSize: '1.1rem',
                          background: "linear-gradient(135deg, #FF7551 0%, #FF5252 100%)",
                          boxShadow: '0 8px 25px rgba(255, 82, 82, 0.4)',
                          '&:hover': {
                            background: "linear-gradient(135deg, #FF5252 0%, #D50000 100%)",
                            boxShadow: '0 12px 30px rgba(255, 82, 82, 0.5)',
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.2s'
                        }}
                      >
                        Buy Now for ₹{selectedShop ? selectedShop.price : '-'}
                      </Button>
                    </Stack>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
