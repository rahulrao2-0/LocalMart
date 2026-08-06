import { redis } from "@localmart/shared";

export const checkIdempotency = async (req, res, next) => {
  const idempotencyKey = req.headers["x-idempotency-key"];
  
  if (!idempotencyKey) {
    return res.status(400).json({ success: false, message: "Idempotency key missing." });
  }

  const redisKey = `idempotency:${idempotencyKey}`;
  
  try {
    // Atomic check-and-set: Lock for 24 hours
    const isSet = await redis.set(redisKey, "processing", { NX: true, EX: 86400 });
    
    if (!isSet) {
      return res.status(409).json({ success: false, message: "Order is already processing." });
    }
    
    req.idempotencyKey = redisKey;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error during idempotency check." });
  }
};
