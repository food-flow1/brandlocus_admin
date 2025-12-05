import { useState, useEffect } from 'react';

/**
 * Hook to detect if we're on the client side.
 * Returns false during SSR and true after hydration.
 * Use this to prevent hydration mismatches.
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * Hook to get auth token only on client side.
 * Returns null during SSR to prevent hydration mismatches.
 */
export function useAuthToken() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem('auth_token'));
  }, []);

  return token;
}

