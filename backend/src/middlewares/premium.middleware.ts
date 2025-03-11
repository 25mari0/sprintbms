// backend/src/middlewares/premium.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../types/authTypes'; // Adjust path as needed

export const premiumMiddleware = {
  isPremium: async (
    req: Request & { user?: JwtPayload },
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    // ensure tokenMiddleware has populated req.user properly
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required',
        data: { redirect: '/login' },
      });
      return;
    }

    const business = req.user.business;
    const now = new Date();

    if (!business?.id) {
      // no business associated: redirect to creation page
      res.status(403).json({
        status: 'error',
        message: 'No business associated with user',
        data: { redirect: '/business/create?mode=create' },
      });
      return;
    }

    if (!business.licenseExpirationDate || business.licenseExpirationDate <= now) {
      // business exists but subscription expired: redirect to renewal
      res.status(403).json({
        status: 'error',
        message: 'Subscription expired',
        data: { redirect: '/business/create?mode=renew' },
      });
      return;
    }

    // business exists and subscription is valid: proceed
    next();
  },
};