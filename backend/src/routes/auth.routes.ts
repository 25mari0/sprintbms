import { Router } from 'express';
import {
  validate,
  emailValidation,
  passwordValidation,
} from '../middlewares/validations.middleware';
import { body } from 'express-validator';
import authController from '../controllers/auth.controller';
import tokenMiddleware from '../middlewares/token.middleware';
import businessMiddleware from '../middlewares/business.middleware';

const router = Router();

// a different route will be used to create workers
// this register route is only used for business owners
// hence why role is defaulted to "owner"
router.post(
  '/register',
  ...emailValidation,
  ...passwordValidation,
  validate,
  authController.register,
);

router.post(
  '/login',
  ...emailValidation,
  ...passwordValidation,
  validate,
  authController.login,
);

router.post(
  '/reset-worker-pw',
  tokenMiddleware.authenticate,
  businessMiddleware.isBusinessOwner,
  authController.resetWorkerPassword,
);

router.post(
  '/update-password',
  body('userId').exists().isUUID().withMessage('User ID must be a valid UUID'),
  ...passwordValidation,
  validate,
  tokenMiddleware.authenticate,
  authController.updatePassword,
);

export default router;
