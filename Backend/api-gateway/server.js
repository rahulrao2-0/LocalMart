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

// Proxy for auth API endpoints (/api/v1/auth)
app.use(
  createProxyMiddleware({
    pathFilter: "/api/v1/auth",
    target: "http://localhost:3001",
    changeOrigin: true,
  })
);

// Proxy for user API endpoints (/api/v1/users)
app.use(
  createProxyMiddleware({
    pathFilter: "/api/v1/users",
    target: "http://localhost:3002",
    changeOrigin: true,
  })
);

// Proxy for product API endpoints (/api/v1/products)
app.use(
  createProxyMiddleware({
    pathFilter: "/api/v1/products",
    target: "http://localhost:3003",
    changeOrigin: true,
  })
);

// Proxy for seller API endpoints (/api/v1/sellers)
app.use(
  createProxyMiddleware({
    pathFilter: "/api/v1/sellers",
    target: "http://localhost:3002",
    changeOrigin: true,
  })
);

// Proxy for order API endpoints (/api/v1/orders)
app.use(
  createProxyMiddleware({
    pathFilter: "/api/v1/orders",
    target: "http://localhost:3004",
    changeOrigin: true,
  })
);

// Proxy for payment API endpoints (/api/v1/payments)
app.use(
  createProxyMiddleware({
    pathFilter: "/api/v1/payments",
    target: "http://localhost:3005",
    changeOrigin: true,
  })
);

// Proxy for inventory API endpoints (/api/v1/inventory)
app.use(
  createProxyMiddleware({
    pathFilter: "/api/v1/inventory",
    target: "http://localhost:3007",
    changeOrigin: true,
  })
);

app.listen(3000, () => {
  console.log("API Gateway running on port 3000");
});