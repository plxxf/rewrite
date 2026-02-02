/**
 * Frontend error tracking utility
 * Captures and logs unhandled errors and promise rejections
 */

export interface ErrorLog {
  type: "error" | "unhandledRejection";
  message: string;
  stack?: string;
  timestamp: string;
  userAgent: string;
  url: string;
}

const ERROR_STORAGE_KEY = "rewrite-runtime-errors";
const MAX_ERRORS = 20;

/**
 * Log an error to localStorage
 */
function logError(errorLog: ErrorLog) {
  try {
    const errors = JSON.parse(localStorage.getItem(ERROR_STORAGE_KEY) || "[]");
    errors.push(errorLog);
    
    // Keep only the most recent errors
    if (errors.length > MAX_ERRORS) {
      errors.splice(0, errors.length - MAX_ERRORS);
    }
    
    localStorage.setItem(ERROR_STORAGE_KEY, JSON.stringify(errors));
    
    // Also log to console in development
    if (import.meta.env.DEV) {
      console.error("[ErrorTracking]", errorLog);
    }
  } catch (e) {
    console.error("[ErrorTracking] Failed to log error:", e);
  }
}

/**
 * Get all logged errors
 */
export function getLoggedErrors(): ErrorLog[] {
  try {
    return JSON.parse(localStorage.getItem(ERROR_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

/**
 * Clear all logged errors
 */
export function clearLoggedErrors() {
  localStorage.removeItem(ERROR_STORAGE_KEY);
}

/**
 * Initialize error tracking
 * Call this once when the app starts
 */
export function initErrorTracking() {
  // Capture unhandled errors
  window.addEventListener("error", (event) => {
    logError({
      type: "error",
      message: event.message,
      stack: event.error?.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  });

  // Capture unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    logError({
      type: "unhandledRejection",
      message: event.reason?.message || String(event.reason),
      stack: event.reason?.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  });

  console.log("[ErrorTracking] Initialized");
}
