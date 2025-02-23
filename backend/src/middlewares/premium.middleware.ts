// middlewares/premium.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error';
import { JwtPayload } from '../types/authTypes';

export const premiumMiddleware = {
    isPremium: async (
    req: Request & { user?: JwtPayload },
    res: Response,
    next: NextFunction
    ): Promise<void> => {
    try {
        if (!req.user?.business?.id) {
        throw new AppError(400, 'No business associated with user');
        }

        // instead of accessing the db everytime, we store the licenseExpirationDate in the access token
        // reducing the number of db calls
        const now = new Date();
        if (req.user.business.licenseExpirationDate && req.user.business.licenseExpirationDate > now) {
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