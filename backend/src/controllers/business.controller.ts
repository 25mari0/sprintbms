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
            const { business, newToken } = await BusinessService.createBusiness(
            userId,
            name,
            licenseExpirationDate // Convert to Date if it comes as a string
            );

            //console.log current header token
            console.log(newToken);
            res.setHeader('Authorization', `Bearer ${newToken}`);


            res.status(201).json({ status: 'success', data: business });
        } catch (error) {
            next(error);
        }
    },
};

export default businessController;