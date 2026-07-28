import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  Chip,
  Stack,
  Divider,
  Card,
  Avatar,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  ShoppingBagOutlined as ShoppingBagIcon,
  ArrowBack as ArrowBackIcon,
  LocalShipping as LocalShippingIcon,
  Storefront as StorefrontIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";

const sampleOrders = [
  {
    orderId: "LM-849201",
    date: "28 July 2026",
    status: "Delivered",
    fulfillment: "Home Delivery",
    shopName: "Shree Grocery Mart",
    items: [
      { name: "Onions 1kg", qty: 2, price: 32 },
      { name: "Tomatoes 1kg", qty: 1, price: 35 },
    ],
    totalAmount: 114,
    deliveryAddress: "Vijay Nagar, Indore",
  },
  {
    orderId: "LM-730194",
    date: "25 July 2026",
    status: "Completed",
    fulfillment: "Store Self-Pickup",
    shopName: "Malwa Furniture Hub",
    items: [{ name: "Ergonomic Office Chair", qty: 1, price: 4499 }],
    totalAmount: 4514,
    deliveryAddress: "Store Pickup at Palasia Square",
  },
];

export default function MyOrdersPage({ themeMode }) {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4, px: { xs: 2, md: 4 } }}>
      <Container maxWidth="md">
        {/* Top Header */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <IconButton onClick={() => navigate("/")} sx={{ bgcolor: "background.paper", boxShadow: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <ShoppingBagIcon color="primary" fontSize="large" /> My Orders
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track active hyperlocal orders and view past purchase receipts
            </Typography>
          </Box>
        </Stack>

        <Stack spacing={3}>
          {sampleOrders.map((order) => (
            <Paper
              key={order.orderId}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1} sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={800}>
                    Order #{order.orderId}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Placed on {order.date} • Store: <strong>{order.shopName}</strong>
                  </Typography>
                </Box>
                <Chip
                  icon={<CheckCircleIcon />}
                  label={order.status}
                  color="success"
                  size="small"
                  sx={{ fontWeight: 700, borderRadius: 2, alignSelf: "flex-start" }}
                />
              </Stack>

              <Divider sx={{ mb: 2 }} />

              {/* Items Summary */}
              <Stack spacing={1} sx={{ mb: 2 }}>
                {order.items.map((item, idx) => (
                  <Stack key={idx} direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.primary">
                      {item.qty} x {item.name}
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      ₹{item.qty * item.price}
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              <Divider sx={{ my: 1.5, borderStyle: "dashed" }} />

              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2}>
                <Box>
                  <Chip
                    icon={order.fulfillment.includes("Delivery") ? <LocalShippingIcon /> : <StorefrontIcon />}
                    label={order.fulfillment}
                    size="small"
                    variant="outlined"
                    sx={{ mr: 1, fontWeight: 700 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {order.deliveryAddress}
                  </Typography>
                </Box>

                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="h6" fontWeight={800} color="primary.main">
                    Total: ₹{order.totalAmount}
                  </Typography>
                  <Button variant="outlined" size="small" startIcon={<ReceiptIcon />} sx={{ borderRadius: 2.5, fontWeight: 700 }}>
                    Invoice
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
