import { Request, Response } from 'express';

export const errorHandler = (error: Error, req: Request, res: Response) => {
  const isDev = process.env.NODE_ENV === 'development';
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  let message = 'An error occurred on the server';
  if (isDev) {
    message = error.message;
  }

  res.status(statusCode).json({
    status: 'error',
    message: message,
    ...(isDev ? { stack: error.stack } : {}),
  });
};

export default errorHandler;
