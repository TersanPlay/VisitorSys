/**
 * Combines multiple class names into a single string, filtering out falsy values.
 * This utility function is used for conditional class application.
 * 
 * @param {...string} classes - Class names to be combined
 * @returns {string} - Combined class names as a single string
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}