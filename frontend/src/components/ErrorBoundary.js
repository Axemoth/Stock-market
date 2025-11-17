import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-lg bg-red-50 text-red-700">
          <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
          <p className="text-sm opacity-75">
            {this.props.fallback || 'An error occurred while loading this component'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-3 px-4 py-2 text-sm bg-red-100 hover:bg-red-200 rounded"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
