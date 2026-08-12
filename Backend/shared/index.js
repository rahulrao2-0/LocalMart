export { redis } from "./redis/redis.js";
export { kafka, initTopics } from "./kafka/client.js";
export { connectProducer, publishEvent } from "./kafka/producers.js";
export { createConsumer } from "./kafka/consumers.js";
export { TOPICS } from "./kafka/topices.js";

// Export Centralized Error Handling System
export {
    AppError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    InternalServerError
} from "./errors/AppError.js";
export { errorHandler } from "./errors/errorHandler.js";
export { asyncHandler } from "./errors/asyncHandler.js";

