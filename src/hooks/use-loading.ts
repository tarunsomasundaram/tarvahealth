import { useState, useCallback } from 'react';

export function useLoading(initialDelay = 800) {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial load - in real app, this would be tied to data fetching
  useState(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, initialDelay);
    return () => clearTimeout(timer);
  });

  const refresh = useCallback(async () => {
    setIsLoading(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  }, []);

  return { isLoading, setIsLoading, refresh };
}
