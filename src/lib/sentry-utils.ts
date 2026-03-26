import * as Sentry from "@sentry/nextjs";

/**
 * Capture exception with context
 */
export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    contexts: {
      error_context: context,
    },
  });
}

/**
 * Capture message with level
 */
export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info"
) {
  Sentry.captureMessage(message, level);
}

/**
 * Add breadcrumb for tracing user actions
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: "info",
  });
}

/**
 * Set user context for error tracking
 */
export function setUser(user: {
  id: string;
  email?: string;
  name?: string;
}) {
  Sentry.setUser(user);
}

/**
 * Clear user context
 */
export function clearUser() {
  Sentry.setUser(null);
}

/**
 * Start performance transaction
 */
export function startTransaction(name: string, op: string) {
  return Sentry.startSpan(
    {
      op,
      name,
      attributes: {
        "http.request": true,
      },
    },
    (span) => span
  );
}

/**
 * Wrap async function with error capture
 */
export async function withErrorCapture<T>(
  fn: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    captureException(error as Error, context);
    throw error;
  }
}
