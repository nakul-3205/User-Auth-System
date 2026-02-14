import  ApiError  from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
    let error = err;

    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || "Internal Server Error";
        error = new ApiError(statusCode, message, [], err.stack);
    }

    logger.error({
        message: error.message,
        statusCode: error.statusCode,
        stack: error.stack,
        path: req.url,
        method: req.method
    });

    const response = {
        ...error,
        message: error.message,
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
    };

    return res.status(error.statusCode).json(response);
};

export { errorHandler };