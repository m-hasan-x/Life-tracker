import { useState, useEffect } from 'react';

/**
 * useLocalStorage
 * A custom React hook that synchronizes state with browser localStorage.
 * 
 * Why this hook exists:
 * Simplifies component state management by automatically persisting state changes to localStorage
 * and initializing state from stored data.
 * 
 * @param key The localStorage key identifier
 * @param initialValue The fallback default value if no stored value exists
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize state from localStorage or fallback
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`useLocalStorage read error for key "${key}":`, error);
      return initialValue;
    }
  });

  // Keep localStorage synchronized whenever storedValue changes
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      }
    } catch (error) {
      console.warn(`useLocalStorage write error for key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
