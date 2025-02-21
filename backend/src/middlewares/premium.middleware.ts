// middlewares/premium.middleware.ts
import { Request, Response, NextFunction } from 'express';
import BusinessService from '../services/business.service';
import { AppError } from '../utils/error';

export const premiumMiddleware = {
    isPremium: async (
    req: Request,
    res: Response,
    next: NextFunction
    ): Promise<void> => {
    try {
        if (!req.user?.business?.id) {
        throw new AppError(400, 'No business associated with user');
        }

        // Assuming business entity has licenseExpirationDate
        const business = await BusinessService.getBusinessById(req.user.business.id); // Assuming this method exists
        if (!business) {
            throw new AppError(400, 'Business not found');
        }

        const now = new Date();
        if (business.licenseExpirationDate && business.licenseExpirationDate > now) {
        next(); // User is premium, proceed
        } else {
        throw new AppError(400, 'Premium access required' );
        }
    } catch (error) {
        next(error);
    }
    },
};

export default premiumMiddleware;