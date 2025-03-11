import { Router } from 'express';
import workerController from '../controllers/worker.controller';
import tokenMiddleware from '../middlewares/token.middleware';
import businessMiddleware from '../middlewares/business.middleware';
import { premiumMiddleware } from '../middlewares/premium.middleware';


const router = Router();

router.post(
    '/createWorker',
    tokenMiddleware.authenticate,
    premiumMiddleware.isPremium,
    businessMiddleware.isBusinessOwner,
    workerController.createWorker,
);

router.post(
  '/account-verification/resend',
  tokenMiddleware.authenticate,
  businessMiddleware.isBusinessOwner,
  workerController.resendWorkerWelcome,
)

// to resend the password reset link, the owner just has to call this route again
router.post(
    '/:userId/reset-password',
    tokenMiddleware.authenticate,
    businessMiddleware.isBusinessOwner,
    workerController.resetWorkerPassword,
  );

router.post(
    '/:userId/suspend',
    tokenMiddleware.authenticate,
    businessMiddleware.isBusinessOwner,
    workerController.suspendWorker,
)

router.post(
    '/:userId/reactivate',
    tokenMiddleware.authenticate,
    businessMiddleware.isBusinessOwner,
    workerController.reactivateWorker,
)

export default router;