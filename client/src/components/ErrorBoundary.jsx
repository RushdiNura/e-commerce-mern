import { Component } from "react";

// Catches render errors so a bug in one page never shows a blank white screen.
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("UI error:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold text-fg">Something went wrong</h1>
        <p className="mt-2 text-muted">
          An unexpected error occurred. Please reload the page and try again.
        </p>
        <button
          type="button"
          className="btn btn-primary mt-6"
          onClick={() => window.location.assign("/")}
        >
          Back to home
        </button>
      </div>
    );
  }
}
