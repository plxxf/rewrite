import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
    
    // Track error for monitoring
    this.logError(error, errorInfo);
  }

  logError(error: Error, errorInfo: React.ErrorInfo) {
    try {
      // Prepare error data
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // Log to localStorage for debugging
      const errors = JSON.parse(localStorage.getItem("rewrite-errors") || "[]");
      errors.push(errorData);
      // Keep only last 10 errors
      if (errors.length > 10) {
        errors.shift();
      }
      localStorage.setItem("rewrite-errors", JSON.stringify(errors));

      // In production, you could send this to a monitoring service
      // Example: fetch('/api/log-error', { method: 'POST', body: JSON.stringify(errorData) });
    } catch (e) {
      console.error("[ErrorBoundary] Failed to log error:", e);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-2xl p-8">
            <AlertTriangle
              size={48}
              className="text-destructive mb-6 flex-shrink-0"
            />

            <h2 className="text-xl mb-4">发生了意外错误</h2>
            <p className="text-sm text-muted-foreground mb-4">
              我们已经记录了这个错误。请尝试刷新页面或联系支持团队。
            </p>

            <div className="p-4 w-full rounded bg-muted overflow-auto mb-6">
              <pre className="text-sm text-muted-foreground whitespace-break-spaces">
                {this.state.error?.stack}
              </pre>
            </div>

            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 cursor-pointer"
              )}
            >
              <RotateCcw size={16} />
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
