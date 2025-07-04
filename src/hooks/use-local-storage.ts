
'use client';

import { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Initialize state with the initial value to prevent hydration mismatch.
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  
  // This flag ensures we don't try to write to localStorage until we've read from it first.
  const [hasMounted, setHasMounted] = useState(false);

  // Read from localStorage on initial client-side render
  useEffect(() => {
    setHasMounted(true);
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  // Write to localStorage when storedValue changes, but only after mounting.
  useEffect(() => {
    if (hasMounted) {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    }
  }, [key, storedValue, hasMounted]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;
