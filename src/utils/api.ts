import { isAxiosError } from 'axios';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

export type ApiValidationErrors = Record<string, string[]>;

export const getApiValidationErrors = (error: unknown): ApiValidationErrors => {
  if (!isAxiosError(error) || !error.response?.data) return {};

  const errors = error.response.data.errors;

  if (!errors || typeof errors !== 'object') return {};

  return errors as ApiValidationErrors;
};

export const applyApiValidationErrors = <TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
  fieldMap: Partial<Record<string, Path<TFieldValues>>> = {}
) => {
  const validationErrors = getApiValidationErrors(error);
  let applied = false;

  Object.entries(validationErrors).forEach(([apiField, messages]) => {
    const message = messages?.[0];
    if (!message) return;

    const formField = fieldMap[apiField] || (apiField as Path<TFieldValues>);

    setError(formField, {
      type: 'server',
      message,
    });
    applied = true;
  });

  return applied;
};

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
