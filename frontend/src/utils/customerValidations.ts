import { RegisterOptions } from 'react-hook-form';

export type CustomerFormData = {
  name: string;
  phone: string;
};

export const customerPhoneValidation: RegisterOptions<CustomerFormData, 'phone'> = {
  required: 'Phone is required',
  pattern: {
    value: /^\+?[1-9]\d{1,14}$/,
    message: 'Invalid phone number format',
  },
  maxLength: {
    value: 15,
    message: 'Phone number cannot exceed 15 characters',
  },
};