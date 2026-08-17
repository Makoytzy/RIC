/**
 * Toast Utility
 * 
 * A simple event-based toast notification system that works with the Toast component.
 * Use showToast() from anywhere in your application to display toast notifications.
 */

// Event name for toast notifications
const TOAST_EVENT = 'show-toast';

/**
 * Display a toast notification
 * @param {Object} options - Toast options
 * @param {string} options.type - Toast type: 'success' | 'error' | 'warning' | 'info'
 * @param {string} options.message - Toast message
 * @param {string} options.title - Toast title (optional)
 * @param {number} options.duration - Auto-dismiss duration in ms (default: 5000)
 * @param {string} options.position - Toast position (default: 'top-right')
 */
export function showToast({ type = 'info', message, title, duration = 5000, position = 'top-right' }) {
  const event = new CustomEvent(TOAST_EVENT, {
    detail: { type, message, title, duration, position }
  });
  window.dispatchEvent(event);
}

/**
 * Subscribe to toast events
 * @param {Function} callback - Function to call when toast is shown
 * @returns {Function} Unsubscribe function
 */
export function subscribeToToast(callback) {
  const handler = (event) => callback(event.detail);
  window.addEventListener(TOAST_EVENT, handler);
  return () => window.removeEventListener(TOAST_EVENT, handler);
}

// Convenience methods for common toast types
export const toast = {
  success: (message, title) => showToast({ type: 'success', message, title }),
  error: (message, title) => showToast({ type: 'error', message, title }),
  warning: (message, title) => showToast({ type: 'warning', message, title }),
  info: (message, title) => showToast({ type: 'info', message, title })
};
