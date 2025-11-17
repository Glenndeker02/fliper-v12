import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  WifiOff,
  AlertCircle,
  RefreshCw,
  XCircle,
  ServerCrash,
  Clock,
  Inbox,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { AppError, ErrorType } from '@/utils/errorHandling';

interface ErrorDisplayProps {
  error?: AppError | null;
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  showIcon?: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  title,
  message,
  onRetry,
  retryText = 'Try Again',
  showIcon = true,
}) => {
  const getIcon = () => {
    if (!error) {
      return <AlertCircle size={48} color={Colors.accent.error} strokeWidth={2} />;
    }

    switch (error.type) {
      case ErrorType.NETWORK:
        return <WifiOff size={48} color={Colors.accent.error} strokeWidth={2} />;
      case ErrorType.TIMEOUT:
        return <Clock size={48} color={Colors.accent.warning} strokeWidth={2} />;
      case ErrorType.NOT_FOUND:
        return <Inbox size={48} color={Colors.text.light} strokeWidth={2} />;
      case ErrorType.API:
        return <ServerCrash size={48} color={Colors.accent.error} strokeWidth={2} />;
      default:
        return <XCircle size={48} color={Colors.accent.error} strokeWidth={2} />;
    }
  };

  const displayTitle = title || (error ? getDefaultTitle(error.type) : 'Error');
  const displayMessage = message || error?.userMessage || 'Something went wrong';

  return (
    <View style={styles.container}>
      {showIcon && <View style={styles.iconContainer}>{getIcon()}</View>}
      <Text style={styles.title}>{displayTitle}</Text>
      <Text style={styles.message}>{displayMessage}</Text>
      {onRetry && error?.retryable !== false && (
        <Pressable style={styles.retryButton} onPress={onRetry}>
          <RefreshCw size={18} color={Colors.text.white} strokeWidth={2.5} />
          <Text style={styles.retryButtonText}>{retryText}</Text>
        </Pressable>
      )}
    </View>
  );
};

const getDefaultTitle = (type: ErrorType): string => {
  switch (type) {
    case ErrorType.NETWORK:
      return 'No Connection';
    case ErrorType.TIMEOUT:
      return 'Request Timeout';
    case ErrorType.NOT_FOUND:
      return 'Not Found';
    case ErrorType.AUTHENTICATION:
      return 'Authentication Required';
    case ErrorType.AUTHORIZATION:
      return 'Access Denied';
    case ErrorType.API:
      return 'Server Error';
    default:
      return 'Error';
  }
};

interface NetworkErrorProps {
  onRetry?: () => void;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({ onRetry }) => {
  return (
    <ErrorDisplay
      title="No Internet Connection"
      message="Please check your connection and try again."
      onRetry={onRetry}
    />
  );
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  action?: {
    text: string;
    onPress: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  action,
}) => {
  return (
    <View style={styles.container}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {action && (
        <Pressable style={styles.actionButton} onPress={action.onPress}>
          <Text style={styles.actionButtonText}>{action.text}</Text>
        </Pressable>
      )}
    </View>
  );
};

interface LoadingErrorProps {
  onRetry: () => void;
  message?: string;
}

export const LoadingError: React.FC<LoadingErrorProps> = ({
  onRetry,
  message = 'Unable to load content',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <AlertCircle size={48} color={Colors.accent.error} strokeWidth={2} />
      </View>
      <Text style={styles.title}>Loading Failed</Text>
      <Text style={styles.message}>{message}</Text>
      <Pressable style={styles.retryButton} onPress={onRetry}>
        <RefreshCw size={18} color={Colors.text.white} strokeWidth={2.5} />
        <Text style={styles.retryButtonText}>Retry</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.background.white,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 300,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.accent.black,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.white,
  },
  actionButton: {
    backgroundColor: Colors.primary.turquoise,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.white,
  },
});
