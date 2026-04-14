import { useState, useRef, useCallback, useMemo } from 'react';
import { ApiError } from '../api/client';

export function useMutation<TPayload, TResult>(
  mutator: (payload: TPayload) => Promise<TResult>,
  onSuccess?: (result: TResult) => void
) {
  const [isMutating, setIsMutating] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const mutate = useCallback(async (payload: TPayload) => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setIsMutating(true);
    setMutationError(null);
    
    try {
      const result = await mutator(payload);
      // Dispatch global refetch to synchronize other components
      window.dispatchEvent(new CustomEvent('refetch-data'));
      onSuccess?.(result);
      return result;
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setMutationError(apiError.message || "Erro durante a operação");
      throw err;
    } finally {
      setIsMutating(false);
      loadingRef.current = false;
    }
  }, [mutator, onSuccess]);

  const clearError = useCallback(() => setMutationError(null), []);

  return useMemo(() => ({ 
    mutate, 
    isMutating, 
    mutationError, 
    clearError 
  }), [mutate, isMutating, mutationError, clearError]);
}
