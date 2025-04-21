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

    getCustomer: async (
        req: Request & { user?: JwtPayload },
        res: Response,
        next: NextFunction,
      ): Promise<void> => {
        try {
            const customerId = req.params.id;
            const businessId = req.user!.business!.id;

            const customer = await CustomerService.getCustomer(
                businessId,
                customerId,
            );

            res.json({ 
                status: 'success', 
                data: customer 
            });
        } catch (error) {
            next(error);
        }
    },

    updateCustomer: async (
        req: Request & { user?: JwtPayload },
        res: Response,
        next: NextFunction,
      ): Promise<void> => {
        try {
            const customerId = req.params.id;
            const businessId = req.user!.business!.id;
            const updateData = req.body;

            const updatedCustomer = await CustomerService.updateCustomer(
                customerId,
                businessId,
                updateData,
            );

            res.json({ 
                status: 'success', 
                data: updatedCustomer 
            });
        } catch (error) {
            next(error);
        }
    },

    deleteCustomer: async (
        req: Request & { user?: JwtPayload },
        res: Response,
        next: NextFunction,
      ): Promise<void> => {
        try {
            const customerId = req.params.id;
            const businessId = req.user!.business!.id;

            await CustomerService.deleteCustomer(
                customerId,
                businessId,
            );

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    },

    getCustomers: async (
        req: Request & { user?: JwtPayload },
        res: Response,
        next: NextFunction,
      ): Promise<void> => {
        try {
            const filters = {
                page: parseInt(req.query.page as string) || 1,
                limit: parseInt(req.query.limit as string) || 10,
                search: req.query.search as string,
                businessId: req.user!.business!.id,
            };

            const customers = await CustomerService.getCustomers(filters);

            res.json({ 
                status: 'success', 
                data: customers 
            });
        } catch (error) {
            next(error);
        }
    },

    
}

export default customerController;