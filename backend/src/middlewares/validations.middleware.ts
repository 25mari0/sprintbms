import { validationResult, body } from 'express-validator';

// reused validations go here - DRY (DONT REPEAT YOURSELF) DUMMY

export const validate = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  next(new Error(errors.array()[0].msg)); // or handle errors as needed
};

// email validation
export const emailValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Must be a valid email address')
  ];
  
  // password validation
export const passwordValidation = [
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[0-9]/).withMessage('Password must contain at least one number')
  ];

// role validation for registration
export const roleValidation = [
    body('role').isIn(['owner', 'worker']).withMessage('Invalid role')
  ];
  