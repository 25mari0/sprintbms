import { Request, Response, NextFunction } from 'express';
import CustomerService from '../services/customer.service';
import { JwtPayload } from '../types/authTypes';

const customerController = {
    createCustomer: async (
        req: Request  & { user?: JwtPayload },
        res: Response,
        next: NextFunction,
      ): Promise<void> => {
        try {
            const { name, phone } = req.body;
            const businessId = req.user!.business!.id;

            const customer = await CustomerService.addCustomer(
                businessId,
                name,
                phone,
            );

            res.json({ 
                status: 'success', 
                data: customer 
            });
        } catch (error) {
            next(error);
        }
    },
}

export default customerController;