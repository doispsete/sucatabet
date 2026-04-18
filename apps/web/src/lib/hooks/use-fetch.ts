import { useState, useCallback, useEffect, useRef, useMemo } from 'react';

export function useFetch<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  options?: { polling?: number }
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Preserve fetcher to avoid stale closures in the interval
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  // Keep track of data to determine if we should show loading state on refresh
  const dataRef = useRef<T | null>(null);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Stabilize deps and serialize them for comparison
  const serializedDeps = JSON.stringify(deps);
  
  const fetch = useCallback(async (isInitialOrManual = false) => {
    // Only show loading indicator if we don't have data yet or it's an initial/manual refetch
    if (!dataRef.current || isInitialOrManual) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const result = await fetcherRef.current();
      
      // Only update state if data actually changed to avoid unnecessary re-renders
      if (JSON.stringify(result) !== JSON.stringify(dataRef.current)) {
        setData(result);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  }, []); 

  // Initial fetch and dependency-based fetch
  useEffect(() => {
    fetch(true);
  }, [serializedDeps, fetch]);

  // Polling setup
  useEffect(() => {
    if (options?.polling) {
      const interval = setInterval(() => fetch(false), options.polling);
      return () => clearInterval(interval);
    }
  }, [fetch, options?.polling]);

  // Global refetch event listener
  useEffect(() => {
    const handleGlobalRefetch = () => {
      fetch(false); // Silent fetch
    };
    window.addEventListener('refetch-data', handleGlobalRefetch);
    return () => window.removeEventListener('refetch-data', handleGlobalRefetch);
  }, [fetch]);

  const refetch = useCallback(() => fetch(true), [fetch]);

  return useMemo(() => ({ 
    data, 
    isLoading, 
    error, 
    refetch 
  }), [data, isLoading, error, refetch]);
}
