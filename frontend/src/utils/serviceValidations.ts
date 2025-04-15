import { RegisterOptions } from 'react-hook-form';

interface ServiceFormData {
  name: string;
  price: number;
  estimated_time_minutes: number;
}

export const serviceNameValidation = {
  required: 'Service name is required',
  minLength: {
    value: 2,
    message: 'Service name must be at least 2 characters long',
  },
  maxLength: {
    value: 50,
    message: 'Service name cannot exceed 50 characters',
  },
} as const satisfies RegisterOptions<ServiceFormData, 'name'>;

export const priceValidation = {
  required: 'Price is required',
  min: {
    value: 0,
    message: 'Price must be a positive number',
  },
  max: {
    value: 10000,
    message: 'Price cannot exceed €10,000',
  },
} as const satisfies RegisterOptions<ServiceFormData, 'price'>;

export const estimatedTimeValidation = {
  required: 'Estimated time is required',
  min: {
    value: 1,
    message: 'Estimated time must be at least 1 minute',
  },
  max: {
    value: 1440, // 24 hours in minutes
    message: 'Estimated time cannot exceed 24 hours',
  },
} as const satisfies RegisterOptions<ServiceFormData, 'estimated_time_minutes'>;

// Manual validation function for use without react-hook-form
export const validateServiceForm = (data: ServiceFormData) => {
  const errors: { name?: string; price?: string; estimated_time_minutes?: string } = {};

  // Validate name
  if (!data.name.trim()) {
    errors.name = serviceNameValidation.required;
  } else if (data.name.length < serviceNameValidation.minLength.value) {
    errors.name = serviceNameValidation.minLength.message;
  } else if (data.name.length > serviceNameValidation.maxLength.value) {
    errors.name = serviceNameValidation.maxLength.message;
  }

  // Validate price
  if (data.price < priceValidation.min.value) {
    errors.price = priceValidation.min.message;
  } else if (data.price > priceValidation.max.value) {
    errors.price = priceValidation.max.message;
  }

  // Validate estimated time
  if (data.estimated_time_minutes < estimatedTimeValidation.min.value) {
    errors.estimated_time_minutes = estimatedTimeValidation.min.message;
  } else if (data.estimated_time_minutes > estimatedTimeValidation.max.value) {
    errors.estimated_time_minutes = estimatedTimeValidation.max.message;
  }

  return errors;
};