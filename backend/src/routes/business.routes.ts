import { Router } from 'express';
import businessController from '../controllers/business.controller';
import tokenMiddleware from '../middlewares/token.middleware';
import businessMiddleware from '../middlewares/business.middleware';
import express from 'express'; 

const router = Router();

/* router.post(
    '/createBusiness',

    tokenMiddleware.authenticate,
    businessMiddleware.isOwner,
    businessMiddleware.doesNotHaveBusiness,
    businessController.createBusiness,
); */

router.post(
    '/create-checkout-session',

    tokenMiddleware.authenticate,
    businessMiddleware.isOwner,
    businessController.createCheckoutSession
);

router.post(
    '/webhook',
    express.raw({ type: 'application/json' }), // Stripe needs raw body
    businessController.handleWebhook
  );

export default router;
