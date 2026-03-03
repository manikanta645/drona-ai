import React from 'react';

/**
 * Error Boundary Component - Catches errors in any child component
 * Displays fallback UI without crashing the entire app
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState(prevState => ({
      error: error,
      errorInfo: errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Log to console for debugging
    console.group('❌ ERROR BOUNDARY CAUGHT ERROR');
    console.error('Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.content}>
            <h1 style={styles.title}>⚠️ Something Went Wrong</h1>
            
            <p style={styles.message}>
              The application encountered an unexpected error and couldn't continue.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={styles.details}>
                <summary style={styles.summary}>Error Details (Development)</summary>
                <div style={styles.errorBox}>
                  <p style={styles.errorTitle}>Error Message:</p>
                  <code style={styles.code}>{this.state.error.toString()}</code>
                  
                  {this.state.errorInfo && (
                    <>
                      <p style={styles.errorTitle} style={{ marginTop: '15px' }}>
                        Component Stack:
                      </p>
                      <code style={styles.code}>
                        {this.state.errorInfo.componentStack}
                      </code>
                    </>
                  )}
                </div>
              </details>
            )}

            <div style={styles.actions}>
              <button 
                onClick={this.handleReset}
                style={styles.button}
              >
                Try Again
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                style={{ ...styles.button, ...styles.buttonSecondary }}
              >
                Back to Home
              </button>
            </div>

            {this.state.errorCount > 3 && (
              <p style={styles.warning}>
                ⚠️ Multiple errors detected. Please refresh the page or contact support.
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a0f0a 0%, #2d1810 100%)',
    fontFamily: 'Georgia, serif',
    color: '#e8d7c3',
    padding: '20px',
  },
  content: {
    background: 'rgba(45, 24, 16, 0.8)',
    border: '2px solid #8b6f47',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '600px',
    textAlign: 'center',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
  },
  title: {
    fontSize: '32px',
    marginBottom: '20px',
    color: '#d4a574',
  },
  message: {
    fontSize: '16px',
    lineHeight: '1.6',
    marginBottom: '30px',
    color: '#c9b8a8',
  },
  details: {
    marginBottom: '30px',
    textAlign: 'left',
  },
  summary: {
    cursor: 'pointer',
    padding: '10px 15px',
    background: 'rgba(212, 165, 116, 0.1)',
    border: '1px solid #8b6f47',
    borderRadius: '6px',
    color: '#d4a574',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  errorBox: {
    background: 'rgba(26, 15, 10, 0.5)',
    border: '1px solid #8b6f47',
    borderRadius: '6px',
    padding: '15px',
    marginTop: '10px',
  },
  errorTitle: {
    fontSize: '12px',
    color: '#a89968',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  code: {
    display: 'block',
    background: 'rgba(0, 0, 0, 0.3)',
    padding: '10px',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#ffd966',
    overflow: 'auto',
    maxHeight: '200px',
    fontFamily: 'monospace',
  },
  actions: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  button: {
    padding: '12px 30px',
    background: '#d4a574',
    border: 'none',
    borderRadius: '6px',
    color: '#1a0f0a',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  buttonSecondary: {
    background: 'transparent',
    border: '2px solid #8b6f47',
    color: '#d4a574',
  },
  warning: {
    padding: '12px 15px',
    background: 'rgba(255, 217, 102, 0.1)',
    border: '1px solid #ffd966',
    borderRadius: '6px',
    color: '#ffd966',
    fontSize: '14px',
  },
};

export default ErrorBoundary;
