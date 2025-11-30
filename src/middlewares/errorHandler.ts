import type { Request, Response, NextFunction } from "express";
import { apiError } from "../utils/apiErrorHandler.js";
import { ErrorLog } from "../models/errorLog.model.js";

export const errorHandler = async (
  err: apiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;

  try {
    await ErrorLog.create({
      message: err.message,
      statusCode,
      errorsMessage: err.errors || [],
      stack: err.stack ?? null, 
      route: req.originalUrl ?? null,
      method: req.method ?? null
    });
  } catch (logError) {
    console.error("Error logging failed:", logError);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};
