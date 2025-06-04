import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/error';

  // next is needed for it to be recognized as an error handler, lint does not like it tho
  export const errorHandler = (
    error: Error | AppError,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
  ) => {
    const isDev = process.env.NODE_ENV === 'development';
    
    // Default to 403 for any authorization/authentication errors
    let statusCode = 403;
    let message = 'Access Denied';
    
    if (error instanceof AppError) {
      // For operational errors, use their status code but maintain generic messages
      statusCode = error.statusCode;
      // Convert all auth-related errors to generic "Access Denied"
      if (statusCode === 401 || statusCode === 403 || statusCode === 404) {
        message = 'Access Denied';
      } else {
        message = error.isOperational ? error.message : 'Internal Server Error';
      }
    }

    // Log only in development
    if (isDev) {
      console.error(`[${req.method} ${req.url}] Error:`, error);
    }

    res.status(statusCode).json({
      status: 'error',
      message,
      ...(isDev ? { stack: error.stack, actualError: error.message } : {}),
    });
  };

export default errorHandler;