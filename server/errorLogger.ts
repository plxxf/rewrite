/**
 * Backend error logging service
 * Provides structured error logging with context
 */

export interface ErrorContext {
  userId?: number;
  operation?: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorLog {
  level: "error" | "warn" | "info";
  message: string;
  error?: Error;
  context?: ErrorContext;
  timestamp: Date;
  stack?: string;
}

/**
 * Log an error with context
 */
export function logError(
  message: string,
  error?: Error,
  context?: ErrorContext
) {
  const errorLog: ErrorLog = {
    level: "error",
    message,
    error,
    context,
    timestamp: new Date(),
    stack: error?.stack,
  };

  // Format log message
  const logMessage = formatLogMessage(errorLog);
  console.error(logMessage);

  // In production, you could send this to a logging service
  // Example: sendToLoggingService(errorLog);
}

/**
 * Log a warning with context
 */
export function logWarning(message: string, context?: ErrorContext) {
  const errorLog: ErrorLog = {
    level: "warn",
    message,
    context,
    timestamp: new Date(),
  };

  const logMessage = formatLogMessage(errorLog);
  console.warn(logMessage);
}

/**
 * Log an info message with context
 */
export function logInfo(message: string, context?: ErrorContext) {
  const errorLog: ErrorLog = {
    level: "info",
    message,
    context,
    timestamp: new Date(),
  };

  const logMessage = formatLogMessage(errorLog);
  console.log(logMessage);
}

/**
 * Format error log for output
 */
function formatLogMessage(log: ErrorLog): string {
  const parts = [
    `[${log.level.toUpperCase()}]`,
    `[${log.timestamp.toISOString()}]`,
  ];

  if (log.context?.operation) {
    parts.push(`[${log.context.operation}]`);
  }

  if (log.context?.userId) {
    parts.push(`[User:${log.context.userId}]`);
  }

  parts.push(log.message);

  if (log.error) {
    parts.push(`\nError: ${log.error.message}`);
    if (log.stack) {
      parts.push(`\nStack: ${log.stack}`);
    }
  }

  if (log.context?.metadata) {
    parts.push(`\nMetadata: ${JSON.stringify(log.context.metadata, null, 2)}`);
  }

  return parts.join(" ");
}

/**
 * Wrap an async function with error logging
 */
export function withErrorLogging<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  operation: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(
        `Operation failed: ${operation}`,
        error instanceof Error ? error : new Error(String(error)),
        { operation }
      );
      throw error;
    }
  }) as T;
}
