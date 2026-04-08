import { useState, useEffect, useCallback, useRef } from 'react';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseFetchOptions {
  immediate?: boolean;
  deps?: unknown[];
}

export function useFetch<T>(
  fetchFn: () => Promise<T>,
  options: UseFetchOptions = {}
): FetchState<T> & { refetch: () => void } {
  const { immediate = true, deps = [] } = options;
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });
  const mountedRef = useRef(true);

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await fetchFn();
      if (mountedRef.current) setState({ data: result, loading: false, error: null });
    } catch (err: unknown) {
      if (mountedRef.current) {
        const msg =
          (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
          'Bir hata oluştu.';
        setState({ data: null, loading: false, error: typeof msg === 'string' ? msg : 'Hata.' });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    if (immediate) execute();
    return () => {
      mountedRef.current = false;
    };
  }, [execute, immediate]);

  return { ...state, refetch: execute };
}
