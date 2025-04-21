import { Router } from 'express';
import customerController from '../controllers/customer.controller';
import tokenMiddleware from '../middlewares/token.middleware';
import businessMiddleware from '../middlewares/business.middleware';
import { premiumMiddleware } from '../middlewares/premium.middleware';

const router = Router();

router.post(
    '/',
    tokenMiddleware.authenticate,
    businessMiddleware.hasBusiness,
    premiumMiddleware.isPremium,
    customerController.createCustomer,
);
router.get(
    '/:id',
    tokenMiddleware.authenticate,
    businessMiddleware.hasBusiness,
    premiumMiddleware.isPremium,
    customerController.getCustomer,
);
router.delete(
    '/:id',
    tokenMiddleware.authenticate,
    businessMiddleware.hasBusiness,
    premiumMiddleware.isPremium,
    customerController.deleteCustomer,
);
router.get(
    '/',
    tokenMiddleware.authenticate,
    businessMiddleware.hasBusiness,
    premiumMiddleware.isPremium,
    customerController.getCustomers,
);
router.patch(
    '/:id',
    tokenMiddleware.authenticate,
    businessMiddleware.hasBusiness,
    premiumMiddleware.isPremium,
    customerController.updateCustomer,
);

export default router;
