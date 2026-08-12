import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
}));

app.use((req, res, next) => {
  console.log("Gateway:", req.method, req.originalUrl);
  next();
});

const handleProxyError = (err, req, res) => {
  console.error(`⚠️ [Gateway Proxy Error ${req.method} ${req.originalUrl}]:`, err.message);
  if (!res.headersSent) {
    res.status(503).json({
      success: false,
      error: "Service is currently unavailable. Please try again later.",
      errorCode: "SERVICE_UNAVAILABLE",
      message: "Service is currently unavailable. Please try again later."
    });
  }
};

// Proxy for auth API endpoints (/api/v1/auth)
app.use(
  createProxyMiddleware({
    pathFilter: "/api/v1/auth",
    target: "http://localhost:3001",
    changeOrigin: true,
    on: { error: handleProxyError }
  })
);

// Proxy for user API endpoints (/api/v1/users)
app.use(
  createProxyMiddleware({
    pathFilter: "/api/v1/users",
    target: "http://localhost:3002",
    changeOrigin: true,
    on: { error: handleProxyError }
  })
);

// Proxy for product API endpoints (/api/v1/products)
app.use(
  createProxyMiddleware({
    pathFilter: "/api/v1/products",
    target: "http://localhost:3003",
    changeOrigin: true,
    on: { error: handleProxyError }
  })
);

// Proxy for seller API endpoints (/api/v1/sellers)
app.use(
  createProxyMiddleware({
    pathFilter: "/api/v1/sellers",
    target: "http://localhost:3002",
    changeOrigin: true,
    on: { error: handleProxyError }
  })
);

// Proxy for order API endpoints (/api/v1/orders)
app.use(
  createProxyMiddleware({
    pathFilter: "/api/v1/orders",
    target: "http://localhost:3004",
    changeOrigin: true,
    on: { error: handleProxyError }
  })
);

// Proxy for payment API endpoints (/api/v1/payments)
app.use(
  createProxyMiddleware({
    pathFilter: "/api/v1/payments",
    target: "http://localhost:3005",
    changeOrigin: true,
    on: { error: handleProxyError }
  })
);

// Proxy for inventory API endpoints (/api/v1/inventory)
app.use(
  createProxyMiddleware({
    pathFilter: "/api/v1/inventory",
    target: "http://localhost:3007",
    changeOrigin: true,
    on: { error: handleProxyError }
  })
);

// Proxy for notification API endpoints (/api/v1/notifications)
app.use(
  createProxyMiddleware({
    pathFilter: "/api/v1/notifications",
    target: "http://localhost:5003",
    changeOrigin: true,
    pathRewrite: { "^/api/v1": "/api" },
    on: { error: handleProxyError }
  })
);

// Proxy for cart API endpoints (/api/v1/cart)
app.use(
  createProxyMiddleware({
    pathFilter: "/api/v1/cart",
    target: "http://localhost:3006",
    changeOrigin: true,
    on: { error: handleProxyError }
  })
);

app.listen(3000, () => {
  console.log("API Gateway running on port 3000");
});