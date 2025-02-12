// middlewares/business.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../types/authTypes';

export const businessMiddleware = {
  hasBusiness: (
    req: Request & { user?: JwtPayload },
    res: Response, 
    next: NextFunction
  ): void => {
    if (!req.user?.business) {
      throw new Error('User does not have an associated business');
    }
    next();
  },

  isBusinessOwner: (
    req: Request & { user?: JwtPayload },
    res: Response,
    next: NextFunction,
  ): void => {
    if (req.user?.role !== 'owner' && !req.user?.business?.id) {
      throw new Error('User does not own a business');
    }
    next();
  },

  isOwner: (
    req: Request & { user?: JwtPayload },
    res: Response,
    next: NextFunction,
  ): void => {
    if (req.user?.role !== 'owner') {
      throw new Error('User is not an owner');
    }
    next();
  },
  
};

export default businessMiddleware;
