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

  isOwner: (
    req: Request & { user?: JwtPayload },
    res: Response, 
    next: NextFunction
  ): void => {
    if (req.user?.role !== 'owner') {
      throw new Error('User is not a business owner');
    }
    next();
  },

  isOwnerOfBusiness: (
    req: Request & { user?: JwtPayload },
    res: Response,
    next: NextFunction,
  ): void => {
    if (req.user?.role !== 'owner') {
      throw new Error('User is not a business owner');
    }
    if (req.user?.business?.id !== req.params.businessId) {
      throw new Error('User is not associated with the business');
    }
    next();
  },
};

export default businessMiddleware;
