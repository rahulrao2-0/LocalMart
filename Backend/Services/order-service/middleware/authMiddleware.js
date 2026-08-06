import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
      console.error("❌ [ORDER SERVICE AUTH] Token missing in request cookies or headers");
      return res.status(401).json({
        success: false,
        message: "Authentication required. Token missing.",
      });
    }

    const secret = process.env.ACCESS_TOKEN_SECRET || "LOCALMART_ACCESS_SECRET_KEY";
    const decoded = jwt.verify(token, secret);
    
    // Normalize decoded token payload (convert userId to id if needed)
    req.user = {
      ...decoded,
      id: decoded.userId || decoded.id,
    };
    
    next();
  } catch (error) {
    console.error("❌ [ORDER SERVICE AUTH] JWT Verification Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};
