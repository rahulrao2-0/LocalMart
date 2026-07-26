import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";
import {
  LocalShipping as LocalShippingIcon,
  Storefront as StorefrontIcon,
  Place as PlaceIcon,
  Star as StarIcon,
  AddShoppingCart as AddShoppingCartIcon,
} from "@mui/icons-material";

// Helper to get beautiful gradients based on product category
const getGradient = (category, themeMode) => {
  const mode = themeMode || "light";
  switch (category?.toLowerCase()) {
    case "vegetables":
    case "grocery":
      return mode === "dark" 
        ? "linear-gradient(135deg, #132A13 0%, #31572C 100%)" 
        : "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)";
    case "furniture":
      return mode === "dark"
        ? "linear-gradient(135deg, #3E2723 0%, #5D4037 100%)"
        : "linear-gradient(135deg, #EFEBE9 0%, #D7CCC8 100%)";
    case "electronics":
    case "tech":
      return mode === "dark"
        ? "linear-gradient(135deg, #0D1B2A 0%, #1B263B 100%)"
        : "linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)";
    default:
      return mode === "dark"
        ? "linear-gradient(135deg, #1A1C29 0%, #2A2E45 100%)"
        : "linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)";
  }
};

const getEmoji = (category) => {
  switch (category?.toLowerCase()) {
    case "vegetables":
      return "🥬";
    case "furniture":
      return "🛋️";
    case "electronics":
      return "🔌";
    default:
      return "🛒";
  }
};

export default function ProductCard({ product, onAddToCart, onClick, mode = "delivery" }) {
  const theme = useTheme();
  const {
    name,
    price,
    nearestShop,
    distanceKm,
    isOpen,
    shopCount,
    category,
    rating = 4.5,
    supportsDelivery = true,
    supportsPickup = true,
  } = product;

  const currentGradient = getGradient(category, theme.palette.mode);
  const emojiSymbol = getEmoji(category);

  const handleCardClick = (e) => {
    // If user clicked any of the action buttons, don't trigger the modal click
    if (e.target.closest("button") || e.target.closest(".MuiChip-root")) {
      return;
    }
    if (onClick) onClick(product);
  };

  return (
    <Card
      onClick={handleCardClick}
      sx={{
        width: 240,
        flexShrink: 0,
        cursor: "pointer",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: theme.palette.mode === "dark"
            ? "0px 15px 35px rgba(0, 0, 0, 0.4), 0 0 1px 1px rgba(108, 93, 211, 0.25)"
            : "0px 15px 35px rgba(108, 93, 211, 0.08)",
          "& .product-image": {
            transform: "scale(1.08)",
          },
          "& .quick-add-btn": {
            opacity: 1,
            transform: "scale(1)",
          },
        },
      }}
    >
      {/* Category Tag */}
      <Chip
        label={category}
        size="small"
        sx={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 2,
          fontSize: "10px",
          fontWeight: 800,
          textTransform: "uppercase",
          backdropFilter: "blur(8px)",
          backgroundColor: theme.palette.mode === "dark" ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.75)",
          color: theme.palette.mode === "dark" ? "#FFFFFF" : "primary.main",
          border: "1px solid",
          borderColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(108, 93, 211, 0.15)",
        }}
      />

      {/* Quick Add Button (visible on hover) */}
      <Tooltip title={`Add to Cart (${mode === "delivery" ? "Delivery" : "Store Pickup"})`}>
        <IconButton
          className="quick-add-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (onAddToCart) onAddToCart(product, mode);
          }}
          disabled={mode === "pickup" && !isOpen}
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 2,
            backgroundColor: "secondary.main",
            color: "#FFFFFF",
            opacity: { xs: 1, md: 0 },
            transform: { xs: "scale(1)", md: "scale(0.85)" },
            boxShadow: "0px 4px 10px rgba(255, 117, 81, 0.3)",
            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              backgroundColor: "secondary.dark",
              transform: "scale(1.1) !important",
            },
            width: 36,
            height: 36,
          }}
        >
          <AddShoppingCartIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Image / Graphic Area */}
      <Box sx={{ overflow: "hidden", position: "relative", height: 130 }}>
        <CardMedia
          component="div"
          className="product-image"
          sx={{
            height: "100%",
            background: currentGradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
            transition: "transform 0.4s ease",
            userSelect: "none",
          }}
        >
          {emojiSymbol}
        </CardMedia>
      </Box>

      {/* Content Area */}
      <CardContent sx={{ p: 2, flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
              <StarIcon sx={{ fontSize: 13, color: "warning.main" }} />
              {rating.toFixed(1)}
            </Typography>
            {shopCount > 1 && (
              <Chip
                label={`From ${shopCount} shops`}
                size="small"
                variant="outlined"
                sx={{
                  height: 18,
                  fontSize: 10,
                  fontWeight: 700,
                  borderColor: "primary.light",
                  color: "primary.main",
                  backgroundColor: theme.palette.mode === "dark" ? "rgba(108, 93, 211, 0.1)" : "rgba(108, 93, 211, 0.03)",
                }}
              />
            )}
          </Stack>

          <Typography variant="body1" fontWeight={700} noWrap sx={{ mb: 0.5, color: "text.primary" }}>
            {name}
          </Typography>

          <Typography variant="h6" fontWeight={800} color="primary.main" sx={{ mb: 1.5 }}>
            ₹{price}
          </Typography>

          {/* Near Shop details */}
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)", border: "1px dashed", borderColor: "divider", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
              <PlaceIcon sx={{ fontSize: 13, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary" fontWeight={600} noWrap sx={{ maxWidth: 170 }}>
                {nearestShop}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="caption" color="text.secondary">
                Distance: <strong>{distanceKm} km</strong>
              </Typography>
              <Chip
                label={isOpen ? "Open" : "Closed"}
                size="small"
                color={isOpen ? "success" : "default"}
                sx={{
                  height: 16,
                  fontSize: "9px",
                  fontWeight: 800,
                  px: 0,
                  borderRadius: 1,
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Dynamic fulfillment selector button */}
        <Stack direction="row" spacing={1}>
          {supportsDelivery && (
            <Button
              size="small"
              variant={mode === "delivery" ? "contained" : "outlined"}
              color="primary"
              fullWidth
              startIcon={<LocalShippingIcon sx={{ fontSize: 15 }} />}
              onClick={(e) => {
                e.stopPropagation();
                if (onAddToCart) onAddToCart(product, "delivery");
              }}
              sx={{ py: 1, fontSize: 12, borderRadius: 2.5 }}
            >
              Delivery
            </Button>
          )}
          {supportsPickup && (
            <Button
              size="small"
              variant={mode === "pickup" ? "contained" : "outlined"}
              color="primary"
              fullWidth
              disabled={!isOpen}
              startIcon={<StorefrontIcon sx={{ fontSize: 15 }} />}
              onClick={(e) => {
                e.stopPropagation();
                if (onAddToCart) onAddToCart(product, "pickup");
              }}
              sx={{ py: 1, fontSize: 12, borderRadius: 2.5 }}
            >
              Pickup
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}