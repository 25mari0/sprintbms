// middlewares/premium.middleware.ts
import { Request, Response, NextFunction } from 'express';
import BusinessService from '../services/business.service';

export const premiumMiddleware = {
    isPremium: async (
    req: Request,
    res: Response,
    next: NextFunction
    ): Promise<void> => {
    try {
        if (!req.user?.business?.id) {
        throw new Error('No business associated with user');
        }

        // Assuming business entity has licenseExpirationDate
        const business = await BusinessService.getBusinessById(req.user.business.id); // Assuming this method exists
        if (!business) {
            throw new Error('Business not found');
        }

        const now = new Date();
        if (business.licenseExpirationDate && business.licenseExpirationDate > now) {
        next(); // User is premium, proceed
        } else {
        throw new Error('Premium access required' );
        }
    } catch (error) {
        next(error);
    }
    },
};

export default premiumMiddleware;