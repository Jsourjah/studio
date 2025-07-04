'use client';

import { useState, useEffect } from 'react';

/**
 * A hook that returns true once the component has mounted on the client.
 * This is useful for avoiding hydration mismatches when rendering client-specific UI.
 */
export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}
