// import express from "express";
// import cors from "cors";
// // import { createProxyMiddleware } from "http-proxy-middleware";

// const app = express();

// app.use(cors({
//     origin: "http://localhost:5173",
//     credentials: true
// }));

// // ❌ removed: app.use(express.json());
// // The gateway doesn't need to parse the body — it just forwards it.

// app.use((req, res, next) => {
//   console.log("Gateway:", req.method, req.originalUrl);
//   next();
// });

// app.use(
//   "/api/v1/auth",
//   createProxyMiddleware({
//     target: "http://localhost:3001",
//     changeOrigin: true,
//   })
// );

// app.listen(3000, () => {
//     console.log("API Gateway Running on port 3000");
// });

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

// http-proxy-middleware v4 fix: Use pathFilter instead of mounting app.use('/api/v1/auth', ...)
// so that /api/v1/auth prefix is preserved when forwarded to target http://localhost:3001
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