import { Request, Response } from 'express';
import { isDevelopment } from '../utils/env';

export const errorHandler = (error: Error, req: Request, res: Response) => {
  console.error('Error:', error.stack);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // directly use error.message, only replace it if not in development and not explicitly set by controller
  let message = error.message;
  if (!isDevelopment()) {
    // here, we assume if the controller set a specific message, it should be used.
    // if it's just an Error with no specific message, use generic.
    if (!message || message === 'Error') {
      message = 'An error occurred on the server';
    }
  }

  res.status(statusCode).json({
    error: {
      status: statusCode,
      message: message,
      ...(isDevelopment() ? { stack: error.stack } : {}),
    },
  });
};

export default errorHandler;
