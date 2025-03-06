import { ApiError } from '../types/authTypes';

export const handleApiError = (err: unknown): ApiError => {
  if (err instanceof Error) {
    return {
      message: (err as ApiError).message || 'An unexpected error occurred',
    };
  }
  return { message: 'An unexpected error occurred' };
};
