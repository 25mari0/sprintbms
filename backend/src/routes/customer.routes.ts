import { Router } from 'express';
import customerController from '../controllers/customer.controller';
import tokenMiddleware from '../middlewares/token.middleware';
import businessMiddleware from '../middlewares/business.middleware';
import premiumMiddleware from '../middlewares/premium.middleware';

const router = Router();

router.post(
    '/createCustomer',
    tokenMiddleware.authenticate,
    businessMiddleware.hasBusiness,
    premiumMiddleware.isPremium,
    customerController.createCustomer,
);

export default router;
