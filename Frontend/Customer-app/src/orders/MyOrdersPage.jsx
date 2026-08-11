import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
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
  IconButton,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Alert,
  Collapse,
  Badge,
  useTheme,
  alpha,
} from "@mui/material";
import {
  ShoppingBagOutlined as ShoppingBagIcon,
  ArrowBack as ArrowBackIcon,
  LocalShipping as LocalShippingIcon,
  Storefront as StorefrontIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  Receipt as ReceiptIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  TwoWheeler as TwoWheelerIcon,
  Inventory2 as InventoryIcon,
  TaskAlt as TaskAltIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

const ORDER_STEPS = [
  { label: "Order Placed", key: "PENDING" },
  { label: "Confirmed", key: "CONFIRMED" },
  { label: "Processing", key: "PROCESSING" },
  { label: "Out for Delivery", key: "OUT_FOR_DELIVERY" },
  { label: "Delivered", key: "DELIVERED" },
];

const getActiveStep = (status) => {
  switch (status) {
    case "PENDING":
      return 0;
    case "CONFIRMED":
      return 1;
    case "PROCESSING":
    case "READY_FOR_PICKUP":
      return 2;
    case "OUT_FOR_DELIVERY":
      return 3;
    case "DELIVERED":
      return 4;
    default:
      return 0;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "DELIVERED":
      return "success";
    case "CONFIRMED":
    case "PROCESSING":
    case "OUT_FOR_DELIVERY":
      return "primary";
    case "PENDING":
      return "warning";
    case "CANCELLED":
      return "error";
    default:
      return "default";
  }
};

export default function MyOrdersPage({ themeMode }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTracker, setExpandedTracker] = useState({});

  // Cancel Dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelReasonOption, setCancelReasonOption] = useState("Placed by mistake");
  const [customReason, setCustomReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const userId = user?.id || user?._id || "guest_user";

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:3000/api/v1/orders/user/${userId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data && data.success) {
        setOrders(data.data || []);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching my orders:", err);
      setError("Failed to load your orders. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [userId]);

  const toggleExpand = (orderId) => {
    setExpandedTracker((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const handleOpenCancelDialog = (order) => {
    setSelectedOrder(order);
    setCancelReasonOption("Placed by mistake");
    setCustomReason("");
    setCancelDialogOpen(true);
  };

  const handleCloseCancelDialog = () => {
    if (!cancelling) {
      setCancelDialogOpen(false);
      setSelectedOrder(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedOrder) return;

    setCancelling(true);
    const reason = cancelReasonOption === "Other" ? customReason || "Order cancelled by customer" : cancelReasonOption;

    try {
      const orderId = selectedOrder._id || selectedOrder.id;
      const res = await fetch(`http://localhost:3000/api/v1/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason }),
      });

      const data = await res.json();
      if (data && data.success) {
        setFeedbackMsg({ type: "success", text: `Order #${selectedOrder.orderNumber || orderId.substring(0, 8)} cancelled successfully.` });
        setCancelDialogOpen(false);
        fetchOrders();
      } else {
        setFeedbackMsg({ type: "error", text: data?.message || "Failed to cancel order." });
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
      setFeedbackMsg({ type: "error", text: "Server error while cancelling order." });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4, px: { xs: 2, md: 4 } }}>
      <Container maxWidth="md">
        {/* Top Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton onClick={() => navigate("/")} sx={{ bgcolor: "background.paper", boxShadow: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <ShoppingBagIcon color="primary" fontSize="large" /> My Orders
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track live order updates, view timeline status, and manage purchases
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={fetchOrders} color="primary" title="Refresh Orders" sx={{ bgcolor: "background.paper", boxShadow: 1 }}>
            <RefreshIcon />
          </IconButton>
        </Stack>

        {feedbackMsg && (
          <Alert severity={feedbackMsg.type} onClose={() => setFeedbackMsg(null)} sx={{ mb: 3, borderRadius: 3 }}>
            {feedbackMsg.text}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
            <CircularProgress size={40} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            {error}
          </Alert>
        ) : orders.length === 0 ? (
          <Paper elevation={0} sx={{ p: 6, textCenter: "center", borderRadius: 4, border: "1px dashed", borderColor: "divider" }}>
            <Box sx={{ textAlign: "center" }}>
              <ShoppingBagIcon sx={{ fontSize: 64, color: "text.secondary", opacity: 0.4, mb: 2 }} />
              <Typography variant="h6" fontWeight={700} gutterBottom>
                No Orders Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                You haven't placed any orders yet. Explore shops around you and place your first order!
              </Typography>
              <Button variant="contained" onClick={() => navigate("/")} sx={{ borderRadius: 3, px: 4, py: 1.2, fontWeight: 700 }}>
                Explore Products
              </Button>
            </Box>
          </Paper>
        ) : (
          <Stack spacing={3}>
            {orders.map((order) => {
              const orderId = order._id || order.id;
              const orderNum = order.orderNumber || `#${orderId.substring(0, 8).toUpperCase()}`;
              const isCancelled = order.orderStatus === "CANCELLED";
              const isDelivered = order.orderStatus === "DELIVERED";
              const canCancel = !isCancelled && !isDelivered && order.orderStatus !== "OUT_FOR_DELIVERY";
              const isExpanded = !!expandedTracker[orderId];
              const activeStep = getActiveStep(order.orderStatus);

              return (
                <Paper
                  key={orderId}
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: isCancelled ? alpha(theme.palette.error.main, 0.3) : "divider",
                    bgcolor: "background.paper",
                    transition: "0.2s",
                    "&:hover": { boxShadow: theme.shadows[2] },
                  }}
                >
                  {/* Order Header */}
                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1} sx={{ mb: 2 }}>
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="subtitle1" fontWeight={800}>
                          Order {orderNum}
                        </Typography>
                        <Chip
                          icon={isCancelled ? <CancelIcon /> : <CheckCircleIcon />}
                          label={order.orderStatus || "PENDING"}
                          color={getStatusColor(order.orderStatus)}
                          size="small"
                          sx={{ fontWeight: 700, borderRadius: 2 }}
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </Typography>
                    </Box>

                    <Button
                      size="small"
                      variant="text"
                      onClick={() => toggleExpand(orderId)}
                      endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      sx={{ fontWeight: 700, textTransform: "none" }}
                    >
                      {isExpanded ? "Hide Tracking" : "Track Order"}
                    </Button>
                  </Stack>

                  {/* Order Tracker / Stepper */}
                  {!isCancelled ? (
                    <Box sx={{ my: 3, px: { xs: 1, sm: 2 } }}>
                      <Stepper activeStep={activeStep} alternativeLabel>
                        {ORDER_STEPS.map((step, idx) => (
                          <Step key={step.key}>
                            <StepLabel
                              StepIconProps={{
                                sx: {
                                  fontSize: 26,
                                  color: idx <= activeStep ? theme.palette.primary.main : theme.palette.grey[300],
                                },
                              }}
                            >
                              <Typography variant="caption" fontWeight={idx === activeStep ? 800 : 500} color={idx <= activeStep ? "text.primary" : "text.secondary"}>
                                {step.label}
                              </Typography>
                            </StepLabel>
                          </Step>
                        ))}
                      </Stepper>
                    </Box>
                  ) : (
                    <Alert severity="error" icon={<CancelIcon />} sx={{ my: 2, borderRadius: 3 }}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        This order was cancelled.
                      </Typography>
                      <Typography variant="caption">
                        {order.timeline?.find((t) => t.status === "CANCELLED")?.message || "Order processing was discontinued."}
                      </Typography>
                    </Alert>
                  )}

                  {/* Collapsible Timeline Events */}
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ p: 2, my: 2, bgcolor: alpha(theme.palette.primary.main, 0.04), borderRadius: 3, border: "1px solid", borderColor: alpha(theme.palette.primary.main, 0.1) }}>
                      <Typography variant="subtitle2" fontWeight={800} gutterBottom sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                        <AccessTimeIcon fontSize="small" color="primary" /> Order Timeline & Activity Log
                      </Typography>
                      <Stack spacing={1.5} sx={{ mt: 1.5, pl: 1 }}>
                        {order.timeline && order.timeline.length > 0 ? (
                          order.timeline.map((event, idx) => (
                            <Box key={idx} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                              <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "primary.main", mt: 0.6, flexShrink: 0 }} />
                              <Box>
                                <Typography variant="body2" fontWeight={700}>
                                  {event.status}: <span style={{ fontWeight: 400 }}>{event.message}</span>
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(event.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </Typography>
                              </Box>
                            </Box>
                          ))
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Order initialized. Waiting for merchant updates.
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </Collapse>

                  <Divider sx={{ mb: 2 }} />

                  {/* Items List */}
                  <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1 }}>
                    Items ({order.items?.length || 0})
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {order.items && order.items.map((item, idx) => (
                      <Stack key={idx} direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.primary">
                          {item.quantity} x {item.productName || item.name || "Item"} {item.weight ? `(${item.weight})` : ""}
                        </Typography>
                        <Typography variant="body2" fontWeight={700}>
                          ₹{(item.subtotal || item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>

                  <Divider sx={{ my: 1.5, borderStyle: "dashed" }} />

                  {/* Order Footer & Actions */}
                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2}>
                    <Box>
                      <Chip
                        icon={<LocalShippingIcon />}
                        label={`Delivery to: ${order.shippingAddress?.city || "Local Address"}`}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1, fontWeight: 700 }}
                      />
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                        {order.shippingAddress?.street}, {order.shippingAddress?.city} ({order.shippingAddress?.postalCode})
                      </Typography>
                    </Box>

                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Typography variant="h6" fontWeight={800} color="primary.main">
                        Total: ₹{parseFloat(order.totalAmount || 0).toFixed(2)}
                      </Typography>

                      {canCancel && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<CancelIcon />}
                          onClick={() => handleOpenCancelDialog(order)}
                          sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: "none" }}
                        >
                          Cancel Order
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        )}

        {/* Cancel Order Confirmation Dialog */}
        <Dialog open={cancelDialogOpen} onClose={handleCloseCancelDialog} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
          <DialogTitle sx={{ fontWeight: 800 }}>Cancel Order</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Are you sure you want to cancel Order <strong>#{selectedOrder?.orderNumber || (selectedOrder?._id || "").substring(0, 8)}</strong>? Please select a reason:
            </Typography>

            <FormControl component="fieldset" fullWidth>
              <RadioGroup value={cancelReasonOption} onChange={(e) => setCancelReasonOption(e.target.value)}>
                <FormControlLabel value="Placed by mistake" control={<Radio size="small" />} label="Placed by mistake" />
                <FormControlLabel value="Delivery time too long" control={<Radio size="small" />} label="Delivery time too long" />
                <FormControlLabel value="Changed my mind" control={<Radio size="small" />} label="Changed my mind" />
                <FormControlLabel value="Incorrect delivery address" control={<Radio size="small" />} label="Incorrect delivery address" />
                <FormControlLabel value="Other" control={<Radio size="small" />} label="Other" />
              </RadioGroup>
            </FormControl>

            {cancelReasonOption === "Other" && (
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Specify your cancellation reason..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                sx={{ mt: 1.5 }}
                size="small"
              />
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseCancelDialog} disabled={cancelling} sx={{ fontWeight: 700, borderRadius: 2 }}>
              Keep Order
            </Button>
            <Button
              onClick={handleConfirmCancel}
              variant="contained"
              color="error"
              disabled={cancelling}
              startIcon={cancelling ? <CircularProgress size={16} color="inherit" /> : <CancelIcon />}
              sx={{ fontWeight: 700, borderRadius: 2.5, px: 3 }}
            >
              Confirm Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
