export class AppError extends Error {
    constructor(message, statusCode = 500, errorCode = 'INTERNAL_SERVER_ERROR', details = null) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class BadRequestError extends AppError {
    constructor(message = 'Bad Request', errorCode = 'BAD_REQUEST', details = null) {
        super(message, 400, errorCode, details);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized access', errorCode = 'UNAUTHORIZED', details = null) {
        super(message, 401, errorCode, details);
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden access', errorCode = 'FORBIDDEN', details = null) {
        super(message, 403, errorCode, details);
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource not found', errorCode = 'NOT_FOUND', details = null) {
        super(message, 404, errorCode, details);
    }
}

export class ConflictError extends AppError {
    constructor(message = 'Resource conflict', errorCode = 'CONFLICT', details = null) {
        super(message, 409, errorCode, details);
    }
}

export class InternalServerError extends AppError {
    constructor(message = 'Internal server error', errorCode = 'INTERNAL_SERVER_ERROR', details = null) {
        super(message, 500, errorCode, details);
    }
}
