import React from "react";
import { Box, Typography, Button, Stack, useTheme } from "@mui/material";
import { ArrowForwardIos as ArrowForwardIosIcon } from "@mui/icons-material";
import ProductCard from "./ProductCard";

export default function CategorySection({
  title,
  subtitle,
  products,
  onSeeAll,
  onAddToCart,
  onProductClick,
  mode = "delivery",
}) {
  const theme = useTheme();

  if (products.length === 0) return null;

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
        </Box>
      </Box>
    </Box>
  );
}