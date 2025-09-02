import toast from 'react-hot-toast';

/**
 * Error handling utility functions
 */

/**
 * Common error messages
 */
export const ErrorMessages = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet to continue',
  INSUFFICIENT_FUNDS: 'Insufficient funds in your wallet',
  TRANSACTION_FAILED: 'Transaction failed. Please try again',
  NETWORK_ERROR: 'Network error. Please check your connection',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  INVALID_INPUT: 'Invalid input. Please check your entries',
  MARKET_NOT_FOUND: 'Market not found',
  MARKET_NOT_ACTIVE: 'This market is not active',
  BET_NOT_FOUND: 'Bet not found',
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again'
};

/**
 * Handle error and display toast notification
 * @param {Error} error - Error object
 * @param {string} [fallbackMessage] - Fallback message if error doesn't have a message
 * @returns {string} Error message
 */
export const handleError = (error, fallbackMessage = ErrorMessages.UNKNOWN_ERROR) => {
  console.error('Error:', error);
  
  // Extract error message
  let errorMessage = fallbackMessage;
  
  if (error) {
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error.message) {
      errorMessage = error.message;
    }
  }
  
  // Check for specific error patterns
  if (errorMessage.includes('wallet') && errorMessage.includes('connect')) {
    errorMessage = ErrorMessages.WALLET_NOT_CONNECTED;
  } else if (errorMessage.includes('insufficient') || errorMessage.includes('enough') || errorMessage.includes('balance')) {
    errorMessage = ErrorMessages.INSUFFICIENT_FUNDS;
  } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    errorMessage = ErrorMessages.NETWORK_ERROR;
  } else if (errorMessage.includes('unauthorized') || errorMessage.includes('permission')) {
    errorMessage = ErrorMessages.UNAUTHORIZED;
  }
  
  // Show toast notification
  toast.error(errorMessage);
  
  return errorMessage;
};

/**
 * Create an error handler function for async operations
 * @param {Function} asyncFunction - Async function to wrap
 * @param {Object} options - Options
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @param {string} [options.errorMessage] - Custom error message
 * @param {boolean} [options.showToast=true] - Whether to show toast notifications
 * @returns {Function} Wrapped function with error handling
 */
export const withErrorHandling = (asyncFunction, options = {}) => {
  const { 
    onSuccess, 
    onError, 
    errorMessage = ErrorMessages.UNKNOWN_ERROR,
    showToast = true
  } = options;
  
  return async (...args) => {
    try {
      const result = await asyncFunction(...args);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (error) {
      const message = handleError(error, errorMessage);
      
      if (onError) {
        onError(error, message);
      }
      
      if (!showToast) {
        // If showToast is false, we need to hide the toast shown by handleError
        toast.dismiss();
      }
      
      throw error;
    }
  };
};

/**
 * Create a component error boundary
 * @param {Function} Component - React component to wrap
 * @param {Function} [FallbackComponent] - Fallback component to render on error
 * @returns {Function} Wrapped component with error boundary
 */
export const withErrorBoundary = (Component, FallbackComponent) => {
  return class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      console.error('Component error:', error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        if (FallbackComponent) {
          return <FallbackComponent error={this.state.error} />;
        }
        
        return (
          <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
            <h3 className="text-error font-medium">Something went wrong</h3>
            <p className="text-textSecondary mt-2">
              {this.state.error?.message || 'An unknown error occurred'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
            >
              Try again
            </button>
          </div>
        );
      }

      return <Component {...this.props} />;
    }
  };
};

export default {
  ErrorMessages,
  handleError,
  withErrorHandling,
  withErrorBoundary
};

