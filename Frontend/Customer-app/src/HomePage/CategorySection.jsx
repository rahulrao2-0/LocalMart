import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Typography, Button, Stack, useTheme, CircularProgress } from "@mui/material";
import { ArrowForwardIos as ArrowForwardIosIcon } from "@mui/icons-material";
import ProductCard from "./ProductCard";
import { fetchProducts } from "../services/productApi";

export default function CategorySection({
  title,
  subtitle,
  category,
  searchQuery,
  onSeeAll,
  onAddToCart,
  onProductClick,
  mode = "delivery",
}) {
  const theme = useTheme();
  
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  // Reset when category or searchQuery changes
  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
  }, [category, searchQuery]);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await fetchProducts(page, category, searchQuery);
        if (!data || !data.data || data.data.length === 0) {
          setHasMore(false);
        } else {
          const mappedProducts = data.data.map((backendProduct) => {
            const shopName = backendProduct.brand;
            const price = backendProduct.price;
            const isOpen = backendProduct.status !== "INACTIVE";
            
            const sellerId = backendProduct.sellerId || backendProduct.seller_id;
            
            return {
              id: backendProduct._id,
              sellerId: sellerId,
              name: backendProduct.name,
              category: backendProduct.category,
              rating: backendProduct.rating,
              supportsDelivery: true,
              supportsPickup: true,
              price: price,
              nearestShop: shopName,
              isOpen: isOpen,
              shopCount: 1,
              shops: [{ shopName, price, isOpen, rating: backendProduct.rating, sellerId: sellerId }],
              images: backendProduct.images || [],
            };
          });

          setProducts((prev) => {
            const existingIds = new Set(prev.map(p => p.id));
            const newUnique = mappedProducts.filter(p => !existingIds.has(p.id));
            return page === 1 ? mappedProducts : [...prev, ...newUnique];
          });
        }
      } catch (err) {
        setHasMore(false);
      }
      setLoading(false);
    };
    
    if (hasMore) loadProducts();
  }, [page, category, searchQuery]);

  const lastElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  if (products.length === 0 && !loading) return null;

  return (
    <Box sx={{ mb: 6 }}>
      {/* HEADER SECTION */}
      <Stack
        direction="row"
        sx={{
          alignItems: "flex-end",
          justifyContent: "space-between",
          mb: 2.5,
          px: 0.5,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{
              letterSpacing: "-0.5px",
              color: "text.primary",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Button
          size="small"
          onClick={onSeeAll}
          endIcon={<ArrowForwardIosIcon sx={{ fontSize: "10px !important" }} />}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            color: "primary.main",
            borderRadius: 2.5,
            px: 1.5,
            py: 0.5,
            "&:hover": {
              backgroundColor: theme.palette.mode === "dark" ? "rgba(108, 93, 211, 0.1)" : "rgba(108, 93, 211, 0.05)",
            },
          }}
        >
          See all
        </Button>
      </Stack>

      {/* HORIZONTAL CARDS SCROLLER */}
      <Box
        sx={{
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            right: 0,
            height: "100%",
            width: 40,
            background: `linear-gradient(to right, transparent, ${theme.palette.background.default})`,
            pointerEvents: "none",
            zIndex: 1,
            opacity: { xs: 0, sm: 1 },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 3,
            overflowX: "auto",
            pb: 2,
            pt: 0.5,
            px: 0.5,
            scrollBehavior: "smooth",
            "&::-webkit-scrollbar": {
              height: 8,
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)",
              borderRadius: 4,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(108, 93, 211, 0.15)",
              borderRadius: 4,
              "&:hover": {
                backgroundColor: "primary.light",
              },
            },
          }}
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onClick={onProductClick}
              mode={mode}
            />
          ))}
          <Box ref={lastElementRef} sx={{ minWidth: 20, display: "flex", justifyContent: "center", alignItems: "center" }}>
            {loading && <CircularProgress size={24} />}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
