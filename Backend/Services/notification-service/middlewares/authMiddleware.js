import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    let token =
      (authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader) ||
      req.cookies?.accessToken ||
      req.cookies?.token;

    if (token === "undefined" || token === "null" || token === "") {
      token = null;
    }

    if (token) {
      const secret = process.env.ACCESS_TOKEN_SECRET || "LOCALMART_ACCESS_SECRET_KEY";
      try {
        const decoded = jwt.verify(token, secret);
        req.user = {
          ...decoded,
          id: decoded.id || decoded.userId || decoded.sub || req.query?.userId || req.params?.userId,
        };
        return next();
      } catch (jwtError) {
        console.warn("⚠️ [NOTIFICATION SERVICE AUTH] JWT Verification Error:", jwtError.message);
      }
    }

    const fallbackUserId = req.query?.userId || req.params?.userId || req.user?.id || req.user?.userId;

    if (fallbackUserId) {
      req.user = { id: fallbackUserId, userId: fallbackUserId };
      return next();
    }

    console.error("❌ [NOTIFICATION SERVICE AUTH] Token missing in request cookies or headers");
    return res.status(401).json({
      success: false,
      message: "Authentication required. Token missing.",
    });
  } catch (error) {
    console.error("❌ [NOTIFICATION SERVICE AUTH] Internal Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication.",
    });
  }
};
