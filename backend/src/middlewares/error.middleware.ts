import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/error';

  // next is needed for it to be recognized as an error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export const errorHandler = (error: Error | AppError, req: Request, res: Response, next: NextFunction) => {
    const isDev = process.env.NODE_ENV === 'development';
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof AppError && error.isOperational ? error.message : 'Internal Server Error';
  
    console.error(`[${req.method} ${req.url}] Error:`, error);
  
    res.status(statusCode).json({
      status: 'error',
      message: isDev ? error.message : message,
      ...(isDev ? { stack: error.stack } : {}),
    });
  };
  
  export default errorHandler;