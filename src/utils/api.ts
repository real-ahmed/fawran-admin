import { isAxiosError } from 'axios';

/**
 * Extracts a user-friendly error message from a Laravel backend API response.
 */
export const parseApiError = (error: unknown, fallbackMessage: string = 'An error occurred'): string => {
  if (isAxiosError(error) && error.response?.data) {
    const data = error.response.data;

    // If there are specific validation errors, return the first one
    if (data.errors && typeof data.errors === 'object') {
      const firstErrorKey = Object.keys(data.errors)[0];
      if (firstErrorKey && Array.isArray(data.errors[firstErrorKey])) {
        return data.errors[firstErrorKey][0];
      }
    }

    // Otherwise, return the general message if available
    if (data.message && typeof data.message === 'string') {
      return data.message;
    }
  }

  // Fallback to error message if it's a standard JS error
  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
};
