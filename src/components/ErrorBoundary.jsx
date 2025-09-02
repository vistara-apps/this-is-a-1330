import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Error boundary component to catch and display errors
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // Call onReset prop if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    const { fallback, children } = this.props;
    
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (fallback) {
        return fallback(this.state.error, this.handleReset);
      }
      
      // Otherwise, use the default fallback UI
      return (
        <div className="p-6 bg-error/10 border border-error/20 rounded-lg animate-fade-in">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="bg-error/20 p-2 rounded-full">
                <AlertTriangle className="w-6 h-6 text-error" />
              </div>
            </div>
            
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-medium text-error">
                Something went wrong
              </h3>
              
              <p className="mt-2 text-sm text-textSecondary">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              
              {this.props.showDetails && this.state.errorInfo && (
                <details className="mt-4 p-2 bg-surfaceLight rounded-md">
                  <summary className="text-sm text-textMuted cursor-pointer">
                    Technical details
                  </summary>
                  <pre className="mt-2 text-xs text-textMuted overflow-auto p-2">
                    {this.state.error?.stack}
                  </pre>
                </details>
              )}
              
              <button
                onClick={this.handleReset}
                className="mt-4 inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

/**
 * Higher-order component to wrap components with ErrorBoundary
 * @param {React.Component} Component - Component to wrap
 * @param {Object} [options] - Options
 * @param {Function} [options.fallback] - Custom fallback UI
 * @param {Function} [options.onReset] - Function to call on reset
 * @param {boolean} [options.showDetails=false] - Whether to show technical details
 * @returns {React.Component} Wrapped component
 */
export const withErrorBoundary = (Component, options = {}) => {
  const { fallback, onReset, showDetails = false } = options;
  
  return function WithErrorBoundary(props) {
    return (
      <ErrorBoundary 
        fallback={fallback} 
        onReset={onReset} 
        showDetails={showDetails}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

export default ErrorBoundary;

