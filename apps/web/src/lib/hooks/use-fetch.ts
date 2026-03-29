import { useState, useCallback, useEffect, useRef } from 'react';
import { ApiError } from '../api/client';

export function useFetch<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  options?: { polling?: number }
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stabilize deps to avoid infinite loops when literals like [] are passed
  const prevDepsRef = useRef(deps);
  const depsChanged = JSON.stringify(deps) !== JSON.stringify(prevDepsRef.current);
  
  if (depsChanged) {
    prevDepsRef.current = deps;
  }

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevDepsRef.current]);

  useEffect(() => {
    fetch();
    if (options?.polling) {
      const interval = setInterval(fetch, options.polling);
      return () => clearInterval(interval);
    }
  }, [fetch, options?.polling]);

  useEffect(() => {
    const handleGlobalRefetch = () => {
      fetch();
    };
    window.addEventListener('refetch-data', handleGlobalRefetch);
    return () => window.removeEventListener('refetch-data', handleGlobalRefetch);
  }, [fetch]);

  return { data, isLoading, error, refetch: fetch };
}
