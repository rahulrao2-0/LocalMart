import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token =
      (authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader) ||
      req.cookies?.accessToken ||
      req.cookies?.token;

    if (token) {
      const secret = process.env.ACCESS_TOKEN_SECRET || "LOCALMART_ACCESS_SECRET_KEY";
      try {
        const decoded = jwt.verify(token, secret);
        req.user = {
          ...decoded,
          id: decoded.userId || decoded.id || decoded.sub,
        };
      } catch (jwtError) {
        console.warn("⚠️ [DELIVERY SERVICE AUTH] JWT Verification Error:", jwtError.message);
      }
    }

    if (req.user || req.params?.partnerId) {
      return next();
    }

    return res.status(401).json({
      success: false,
      message: "Authentication required. Token missing.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication.",
    });
  }
};
