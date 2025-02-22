import { Request, Response, NextFunction } from 'express';
import BusinessService from '../services/business.service';
import { JwtPayload } from '../types/authTypes';

const businessController = {
    createBusiness: async (
        req: Request & { user?: JwtPayload },
        res: Response,
        next: NextFunction
        ): Promise<void> => {
        try {
            const userId = req.user!.userId;

            const { name } = req.body;
            const licenseExpirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
            // const { licenseExpirationDate } = req.body; 

            //returns new access token with the business ID associated
            const { business, newAccessToken } = await BusinessService.createBusiness(req.user?.business?.id, 
            userId,
            name,
            licenseExpirationDate // Convert to Date if it comes as a string
            );

            res.status(201).json({ status: 'success', data: business, accessToken: newAccessToken});
        } catch (error) {
            next(error);
        }
    },
};

export default businessController;