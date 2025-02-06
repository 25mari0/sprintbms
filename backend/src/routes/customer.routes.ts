import { Router } from 'express';
import customerController from '../controllers/customer.controller';
import tokenMiddleware from '../middlewares/token.middleware';

const router = Router();

router.post(
    '/createCustomer',
    tokenMiddleware.authenticate,
    customerController.createCustomer,
);

export default router;
