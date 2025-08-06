import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for monitoring
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log to error reporting service (if available)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false,
        error_id: this.state.errorId,
        component_stack: errorInfo.componentStack
      });
    }
  }

  handleRetry = () => {
    // Reset error state to retry rendering
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    });
  };

  handleRefresh = () => {
    // Force page refresh
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { fallback: CustomFallback, showDetails = false } = this.props;
      
      // Use custom fallback if provided
      if (CustomFallback) {
        return <CustomFallback 
          error={this.state.error} 
          onRetry={this.handleRetry}
          onRefresh={this.handleRefresh}
        />;
      }

      // Default error UI
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-icon">⚠️</div>
            <h2>Oops! Something went wrong</h2>
            <p>We're sorry, but something unexpected happened. Please try refreshing the page.</p>
            
            <div className="error-actions">
              <button 
                className="error-button primary" 
                onClick={this.handleRetry}
              >
                Try Again
              </button>
              <button 
                className="error-button secondary" 
                onClick={this.handleRefresh}
              >
                Refresh Page
              </button>
            </div>

            {showDetails && this.state.error && (
              <details className="error-details">
                <summary>Technical Details</summary>
                <div className="error-info">
                  <p><strong>Error ID:</strong> {this.state.errorId}</p>
                  <p><strong>Error:</strong> {this.state.error.toString()}</p>
                  {this.state.errorInfo && (
                    <pre className="error-stack">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundaries
export const withErrorBoundary = (Component, fallback = null, options = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary fallback={fallback} {...options}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Specific error boundaries for different parts of the app
export const DiscoverErrorBoundary = ({ children }) => (
  <ErrorBoundary 
    fallback={({ onRetry }) => (
      <div className="discover-error-fallback">
        <h3>Unable to load profiles</h3>
        <p>We're having trouble loading new profiles for you to discover.</p>
        <button onClick={onRetry} className="retry-button">
          Try Again
        </button>
      </div>
    )}
  >
    {children}
  </ErrorBoundary>
);

export const ChatErrorBoundary = ({ children }) => (
  <ErrorBoundary 
    fallback={({ onRetry }) => (
      <div className="chat-error-fallback">
        <h3>Chat temporarily unavailable</h3>
        <p>We're having trouble loading your messages. Please try again.</p>
        <button onClick={onRetry} className="retry-button">
          Retry
        </button>
      </div>
    )}
  >
    {children}
  </ErrorBoundary>
);

export const GamesErrorBoundary = ({ children }) => (
  <ErrorBoundary 
    fallback={({ onRetry }) => (
      <div className="games-error-fallback">
        <h3>Games not available</h3>
        <p>We're having trouble loading games in your area.</p>
        <button onClick={onRetry} className="retry-button">
          Try Again
        </button>
      </div>
    )}
  >
    {children}
  </ErrorBoundary>
);

export default ErrorBoundary;