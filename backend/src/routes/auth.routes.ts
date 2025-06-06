import { Router } from 'express';
import {
  validate,
  emailValidation,
  passwordValidation,
} from '../middlewares/validations.middleware';
import { body } from 'express-validator';
import authController from '../controllers/auth.controller';
import tokenMiddleware from '../middlewares/token.middleware';

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

router.get('/me', 
  tokenMiddleware.authenticate,
  authController.getUserData,
);

router.post(
  '/logout',
  tokenMiddleware.authenticate,
  authController.logout,
)

// ------------ OWNER SPECIFIC PASSWORD RESET -------------------
router.get(
  '/password-reset/verify-token',
  authController.validateVerificationToken
);

router.post(
  '/password-reset/set',
  ...passwordValidation,
  authController.setPasswordToken
);

router.post(
  '/password-reset/forgot',
  ...emailValidation,
  validate,
  authController.forgotPassword
)

// ------------ ACCOUNT VERIFICATION -------------------
// PRESENT & EXPIRED ? respond with, EXPIRED!, show small notification under the log in form, 
// with the option to to a function which resends a new link (route /account-verification/resend)
router.post(
  '/account-verification/verify',
  authController.verifyAccount
);

// presented as an option on front-end when a GET /verify-account replies with Invalid or expired token.
router.post(
  '/account-verification/resend',
  authController.resendVerificationLink
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
