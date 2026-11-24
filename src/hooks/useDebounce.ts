import { useState, useEffect } from 'react';

/**
 * useDebounce
 * A custom React hook that delays updating a value until a specified delay has elapsed.
 * 
 * Why this hook exists:
 * Optimizes performance by preventing expensive filter or search operations on every keystroke.
 * 
 * @param value The raw input value (e.g. search query)
 * @param delay Milliseconds to wait before updating the debounced value (default: 300ms)
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timer to update debounced value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel timer if value changes before the delay has elapsed
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
