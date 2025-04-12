import { Router } from 'express';
import workerController from '../controllers/worker.controller';
import tokenMiddleware from '../middlewares/token.middleware';
import businessMiddleware from '../middlewares/business.middleware';
import { premiumMiddleware } from '../middlewares/premium.middleware';
import authController from '../controllers/auth.controller';


const router = Router();

router.post(
    '/createWorker',
    tokenMiddleware.authenticate,
    premiumMiddleware.isPremium,
    businessMiddleware.isBusinessOwner,
    workerController.createWorker,
);

//PASSWORD RESET
//route for OWNER to reset the worker's password
router.post(
  '/:userId/reset-password',
  tokenMiddleware.authenticate,
  premiumMiddleware.isPremium,
  businessMiddleware.isBusinessOwner,
  workerController.resetWorkerPassword,
)

//route for OWNER to resend the worker's password reset link
router.post(
  '/:userId/resend-password-reset',
  tokenMiddleware.authenticate,
  premiumMiddleware.isPremium,
  businessMiddleware.isBusinessOwner,
  workerController.resendWorkerPasswordReset,
)

//route to verify if the token is valid
router.get(
  '/verify-reset-token',
  authController.validateVerificationToken,
)

//route for the worker to set a new password
router.post(
  '/set-password',
  workerController.setPassword,
)

//----------------------------------------------------------------

//ACCOUNT VERIFICATION
router.post(
  '/account-verification/:userId/resend',
  tokenMiddleware.authenticate,
  businessMiddleware.isBusinessOwner,
  workerController.resendWorkerWelcome,
)

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

//----------------------------------------------------------------


//replies with the worker's data
router.get(
    '/:userId',
    tokenMiddleware.authenticate,
    workerController.getWorker,
)

//replies with the list of workers for the business and their status (active, unverified, suspended)
router.get(
  '/',
  tokenMiddleware.authenticate,
  workerController.getWorkers,
)

export default router;