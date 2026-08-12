export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
    const errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';
    const message = err.message || 'An unexpected error occurred';

    if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
        console.error('🔥 [ERROR HANDLER]:', err);
    }

    res.status(statusCode).json({
        success: false,
        error: message,
        errorCode: errorCode,
        message: message,
        ...(err.details && { details: err.details }),
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
};
