import { ApiError } from '../types/authTypes';

export const handleApiError = (err: unknown): string => {
  if (err instanceof Error) {
    return (err as ApiError).message || 'An unexpected error occurred';
  }
  return 'An unexpected error occurred';
};