/**
 * Script to suppress console methods in production
 * This should be run as a build step or included in the app
 */

if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
  // Store original console methods
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    debug: console.debug,
    info: console.info,
  };

  // Override console methods to be no-ops in production
  console.log = () => {};
  console.error = () => {};
  console.warn = () => {};
  console.debug = () => {};
  console.info = () => {};

  // Optional: Log to external service in production
  // You can integrate with error tracking services like Sentry here
}

