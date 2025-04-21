import { RegisterOptions } from 'react-hook-form';

// Generic type for any form data
type AnyFormData = Record<string, any>;

// Reusable validation rules (typed generically)
export const nameValidation = {
  required: 'Name is required',
  minLength: {
    value: 3,
    message: 'Name must be at least 2 characters long',
  },
  maxLength: {
    value: 50,
    message: 'Name cannot exceed 50 characters',
  }
} as const satisfies RegisterOptions<AnyFormData, 'name'>;

export const emailValidation = {
  required: 'Email is required',
  pattern: {
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Must be a valid email address',
  },
} as const satisfies RegisterOptions<AnyFormData, 'email'>;

export const passwordValidation = {
  required: 'Password is required',
  minLength: {
    value: 8,
    message: 'Password must be at least 8 characters long',
  },
  pattern: {
    value: /^(?=.*[A-Z])(?=.*[0-9])/,
    message:
      'Password must contain at least one uppercase letter and one number',
  },
} as const satisfies RegisterOptions<AnyFormData, 'password'>;
