// backend/src/routes/auth.routes.ts
import { Router } from 'express';
import { validate,
    emailValidation, 
    passwordValidation, 
    roleValidation 
 } from '../middlewares/validations.middleware';
 import { body } from 'express-validator';
import { register, login, resetPassword, updatePassword } from '../controllers/auth.controller';

const router = Router();

// a different route will be used to create workers
// this register route is only used for business owners
// hence why role is defaulted to "owner"
router.post(
    '/register',
    ...emailValidation,
    ...passwordValidation,
    validate,
    register
  );
  
  router.post(
    '/login',
    ...emailValidation,
    ...passwordValidation,
    validate,
    login
  );
  
  router.post(
    '/reset-password',
    ...emailValidation,
    validate,
    resetPassword
  );
  
  router.post(
    '/update-password',
    body('userId').exists().isUUID().withMessage('User ID must be a valid UUID'),
    ...passwordValidation,
    validate,
    updatePassword
  );
  
  export default router;