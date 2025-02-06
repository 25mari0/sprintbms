import { Router } from 'express';
import businessController from '../controllers/business.controller';
import tokenMiddleware from '../middlewares/token.middleware';

const router = Router();

router.post(
    '/createBusiness',
    tokenMiddleware.authenticate,
    businessController.createBusiness,
);

export default router;
