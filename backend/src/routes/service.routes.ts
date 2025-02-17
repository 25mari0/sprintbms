import { Router } from 'express';
import serviceController from '../controllers/service.controller';
import tokenMiddleware from '../middlewares/token.middleware';
import businessMiddleware from '../middlewares/business.middleware';

const router = Router();

router.post(
  '/',
  tokenMiddleware.authenticate,
  businessMiddleware.hasBusiness,
  serviceController.createService
);

router.get(
  '/',
  tokenMiddleware.authenticate,
  businessMiddleware.hasBusiness,
  serviceController.getAllServices
);

router.get(
  '/:id',
  tokenMiddleware.authenticate,
  businessMiddleware.hasBusiness,
  serviceController.getServiceById
);

router.put(
  '/:id',
  tokenMiddleware.authenticate,
  businessMiddleware.hasBusiness,
  serviceController.updateService
);

router.delete(
  '/:id',
  tokenMiddleware.authenticate,
  businessMiddleware.hasBusiness,
  serviceController.deleteService
);

export default router;