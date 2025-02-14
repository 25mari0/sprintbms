import { Router } from 'express';
import businessController from '../controllers/business.controller';
import tokenMiddleware from '../middlewares/token.middleware';
import businessMiddleware from '../middlewares/business.middleware';

const router = Router();

router.post(
    '/createBusiness',
    tokenMiddleware.authenticate,
    businessMiddleware.isOwner,
    businessController.createBusiness,
);

export default router;
