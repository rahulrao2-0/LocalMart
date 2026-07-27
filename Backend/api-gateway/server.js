// import express from "express";
import cors from "cors";
// import { createProxyMiddleware } from "http-proxy-middleware";

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
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

console.log("API Gateway starting...");
app.use((req, res, next) => {
  console.log("Gateway:", req.method, req.originalUrl);
  next();
});
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));


app.use(
  "/api/v1/auth",
  createProxyMiddleware({
    target: "http://localhost:3001",
    changeOrigin: true,
    logLevel: "debug",
  })
);

app.listen(3000, () => {
  console.log("Gateway running");
});