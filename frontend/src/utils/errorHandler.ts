export const handleApiError = (error: unknown, defaultMessage: string) => {
    console.warn(defaultMessage, error);
  };