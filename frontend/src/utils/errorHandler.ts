import axios from "axios";

export const handleApiError = (error: unknown, defaultMessage: string): string => {
  if (axios.isAxiosError(error) && error.response?.data?.message) {
    return error.response.data.message;
  }
  console.warn(defaultMessage, error);
  return defaultMessage;
};