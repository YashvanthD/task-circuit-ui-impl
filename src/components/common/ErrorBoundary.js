/**
 * ErrorBoundary Component
 * Catches React errors and displays fallback UI
 * Essential for production applications
 *
 * @module components/common/ErrorBoundary
 */

import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

/**
 * ErrorBoundary - Catches errors in component tree
 *
 * @example
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console
    console.error('ErrorBoundary caught error:', error, errorInfo);

    // Store error info
    this.setState({ errorInfo });

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // Example:
    // Sentry.captureException(error, { extra: errorInfo });
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
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            bgcolor: 'background.default',
            p: 3
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              textAlign: 'center'
            }}
          >
            {/* Error Icon */}
            <ErrorOutlineIcon
              sx={{
                fontSize: 80,
                color: 'error.main',
                mb: 2
              }}
            />

            {/* Title */}
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Oops! Something went wrong
            </Typography>

            {/* Message */}
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Typography>

            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 3,
                  bgcolor: 'grey.100',
                  textAlign: 'left',
                  maxHeight: 200,
                  overflow: 'auto'
                }}
              >
                <Typography variant="caption" component="pre" sx={{ m: 0 }}>
                  {this.state.errorInfo.componentStack}
                </Typography>
              </Paper>
            )}

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
              <Button
                variant="outlined"
                onClick={this.handleReset}
              >
                Try Again
              </Button>
            </Box>

            {/* Help Text */}
            <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
              If this problem persists, please contact support
            </Typography>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
