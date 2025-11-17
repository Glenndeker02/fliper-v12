import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { AppError, parseError, logError } from '@/utils/errorHandling';

export interface UseErrorHandlerOptions {
  showAlert?: boolean;
  alertTitle?: string;
  onError?: (error: AppError) => void;
  logErrors?: boolean;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const {
    showAlert = true,
    alertTitle = 'Error',
    onError,
    logErrors = true,
  } = options;

  const [error, setError] = useState<AppError | null>(null);
  const [isError, setIsError] = useState(false);

  const handleError = useCallback(
    (err: unknown, context?: Record<string, any>) => {
      const appError = parseError(err);

      if (logErrors) {
        logError(appError, context);
      }

      setError(appError);
      setIsError(true);

      if (onError) {
        onError(appError);
      }

      if (showAlert) {
        Alert.alert(alertTitle, appError.userMessage, [
          {
            text: 'OK',
            onPress: () => {
              setIsError(false);
              setError(null);
            },
          },
        ]);
      }
    },
    [showAlert, alertTitle, onError, logErrors]
  );

  const clearError = useCallback(() => {
    setError(null);
    setIsError(false);
  }, []);

  const resetError = useCallback(() => {
    clearError();
  }, [clearError]);

  return {
    error,
    isError,
    handleError,
    clearError,
    resetError,
  };
};

export interface UseAsyncErrorOptions extends UseErrorHandlerOptions {
  onSuccess?: () => void;
  onFinally?: () => void;
}

export const useAsyncError = (options: UseAsyncErrorOptions = {}) => {
  const { onSuccess, onFinally, ...errorOptions } = options;
  const { error, isError, handleError, clearError } = useErrorHandler(errorOptions);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async <T>(asyncFn: () => Promise<T>): Promise<T | null> => {
      try {
        setIsLoading(true);
        clearError();
        const result = await asyncFn();

        if (onSuccess) {
          onSuccess();
        }

        return result;
      } catch (err) {
        handleError(err);
        return null;
      } finally {
        setIsLoading(false);
        if (onFinally) {
          onFinally();
        }
      }
    },
    [handleError, clearError, onSuccess, onFinally]
  );

  return {
    execute,
    isLoading,
    error,
    isError,
    clearError,
  };
};
