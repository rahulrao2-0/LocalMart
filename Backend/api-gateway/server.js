import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
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




app.listen(3000, () => {
  console.log("API Gateway running on port 3000");
});