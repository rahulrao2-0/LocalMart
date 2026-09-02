import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import { RateLimiterMemory } from "rate-limiter-flexible";

const app = express();

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
    credentials: true,
    exposedHeaders: ["Retry-After", "X-RateLimit-Limit", "X-RateLimit-Remaining"]
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

// --- Rate Limiting Setup (Token Bucket) ---

const authRateLimiter = new RateLimiterMemory({
  points: 10,        // Capacity (burst)
  duration: 60,     // Refill window in seconds
});

const orderRateLimiter = new RateLimiterMemory({
  points: 30,       
  duration: 60,     
});

const generalRateLimiter = new RateLimiterMemory({
  points: 100,      
  duration: 10,     
});

const rateLimitMiddleware = (limiter, errorMessage) => {
  return (req, res, next) => {
    limiter.consume(req.ip, 1)
      .then((rateLimiterRes) => {
        res.set({
          "X-RateLimit-Limit": limiter.points,
          "X-RateLimit-Remaining": rateLimiterRes.remainingPoints,
        });
        next();
      })
      .catch((rateLimiterRes) => {
        const retrySecs = Math.ceil(rateLimiterRes.msBeforeNext / 1000);
        console.warn(`🛑 [RATE LIMIT EXCEEDED] IP: ${req.ip} | Route: ${req.originalUrl} | Wait: ${retrySecs}s`);
        
        res.set({
          "Retry-After": rateLimiterRes.msBeforeNext / 1000,
          "X-RateLimit-Limit": limiter.points,
          "X-RateLimit-Remaining": rateLimiterRes.remainingPoints,
        });
        res.status(429).json({
          success: false,
          error: "Too Many Requests",
          message: errorMessage,
          errorCode: "RATE_LIMIT_EXCEEDED"
        });
      });
  };
};

const authLimit = rateLimitMiddleware(authRateLimiter, "Too many login attempts. Please wait a minute.");
const orderLimit = rateLimitMiddleware(orderRateLimiter, "Too many order requests. Please slow down.");
const generalLimit = rateLimitMiddleware(generalRateLimiter, "Too many requests. Please try again later.");

// Apply limiters to specific paths
app.use("/api/v1/auth", authLimit);
app.use("/api/v1/orders", orderLimit);
app.use(generalLimit); // General limiter for all other routes

// Proxy for auth API endpoints (/api/v1/auth)
app.use(
  createProxyMiddleware({
    pathFilter: "/api/v1/auth",
    target: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
    changeOrigin: true,
    /* on: { error: handleProxyError } */
  })
);

// Proxy for user API endpoints (/api/v1/users)
app.use(
  createProxyMiddleware({
    pathFilter: "/api/v1/users",
    target: process.env.USER_SERVICE_URL || "http://localhost:3002",
    changeOrigin: true,
    /* on: { error: handleProxyError } */
  })
);

// Proxy for product API endpoints (/api/v1/products)
app.use(
  createProxyMiddleware({
    pathFilter: "/api/v1/products",
    target: process.env.PRODUCT_SERVICE_URL || "http://localhost:3003",
    changeOrigin: true,
    /* on: { error: handleProxyError } */
  })
);

// Proxy for seller API endpoints (/api/v1/sellers)
app.use(
  createProxyMiddleware({
    pathFilter: "/api/v1/sellers",
    target: process.env.SELLER_SERVICE_URL || "http://localhost:3002",
    changeOrigin: true,
    /* on: { error: handleProxyError } */
  })
);

// Proxy for order API endpoints (/api/v1/orders)
app.use(
  createProxyMiddleware({
    pathFilter: "/api/v1/orders",
    target: process.env.ORDER_SERVICE_URL || "http://localhost:3004",
    changeOrigin: true,
    /* on: { error: handleProxyError } */
  })
);

// Proxy for payment API endpoints (/api/v1/payments)
app.use(
  createProxyMiddleware({
    pathFilter: "/api/v1/payments",
    target: process.env.PAYMENT_SERVICE_URL || "http://localhost:3005",
    changeOrigin: true,
    /* on: { error: handleProxyError } */
  })
);

// Proxy for inventory API endpoints (/api/v1/inventory)
app.use(
  createProxyMiddleware({
    pathFilter: "/api/v1/inventory",
    target: process.env.INVENTORY_SERVICE_URL || "http://localhost:3007",
    changeOrigin: true,
    /* on: { error: handleProxyError } */
  })
);

// Proxy for notification API endpoints (/api/v1/notifications)
app.use(
  createProxyMiddleware({
    pathFilter: "/api/v1/notifications",
    target: process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3009",
    changeOrigin: true,
    pathRewrite: { "^/api/v1": "/api" },
    /* on: { error: handleProxyError } */
  })
);

// Proxy for cart API endpoints (/api/v1/cart)
app.use(
  createProxyMiddleware({
    pathFilter: "/api/v1/cart",
    target: process.env.CART_SERVICE_URL || "http://localhost:3006",
    changeOrigin: true,
    pathRewrite: { "^/api/v1/cart": "/cart" },
    /* on: { error: handleProxyError } */
  })
);

// Proxy for delivery API endpoints (/api/v1/delivery)
app.use(
  createProxyMiddleware({
    pathFilter: "/api/v1/delivery",
    target: process.env.DELIVERY_SERVICE_URL || "http://localhost:3008",
    changeOrigin: true,
    /* on: { error: handleProxyError } */
  })
);

// Proxy for search API endpoints (/api/v1/search)
app.use(
  createProxyMiddleware({
    pathFilter: "/api/v1/search",
    target: process.env.SEARCH_SERVICE_URL || "http://localhost:4004",
    changeOrigin: true,
    pathRewrite: { "^/api/v1/search": "/api/search" },
    /* on: { error: handleProxyError } */
  })
);

app.listen(3000, () => {
  console.log("API Gateway running on port 3000");
});