import { logger } from "../utils/logger.js";

export const errorMiddleware = (err, req, res, next) => {
  logger.error({
    message: err.message,
    path: req.path,
    method: req.method,
    stack: err.stack
  });
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || "Internal server error"
  });
};
