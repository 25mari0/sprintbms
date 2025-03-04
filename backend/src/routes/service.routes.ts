import { Router } from 'express';
import serviceController from '../controllers/service.controller';
import tokenMiddleware from '../middlewares/token.middleware';
import businessMiddleware from '../middlewares/business.middleware';
import premiumMiddleware from '../middlewares/premium.middleware';

const router = Router();

router.post(
  '/',
  tokenMiddleware.authenticate,
  businessMiddleware.hasBusiness,
  premiumMiddleware.isPremium,
  serviceController.createService
);

router.get(
  '/',
  tokenMiddleware.authenticate,
  businessMiddleware.hasBusiness,
  premiumMiddleware.isPremium,
  serviceController.getAllServices
);

router.get(
  '/:id',
  tokenMiddleware.authenticate,
  businessMiddleware.hasBusiness,
  premiumMiddleware.isPremium,
  serviceController.getServiceById
);

router.put(
  '/:id',
  tokenMiddleware.authenticate,
  businessMiddleware.hasBusiness,
  premiumMiddleware.isPremium,
  serviceController.updateService
);

router.delete(
  '/:id',
  tokenMiddleware.authenticate,
  businessMiddleware.hasBusiness,
  premiumMiddleware.isPremium,
  serviceController.deleteService
);

export default router;