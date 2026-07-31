import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authenticated. No access token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired access token." });
  }
};

export const requireSeller = (req, res, next) => {
  if (!req.user || !req.user.roles || !req.user.roles.includes("SELLER")) {
    return res.status(403).json({ success: false, message: "Access denied. Seller permissions required." });
  }
  next();
};
