import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught UI error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center text-white">
          <h2>Something went wrong.</h2>
          <button onClick={() => window.location.reload()} className="mt-4 bg-emerald-500 px-4 py-2 rounded">
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
