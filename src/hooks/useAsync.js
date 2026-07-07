import { useEffect, useState, useCallback } from "react";

/**
 * Generic data-fetching hook used across pages instead of duplicating
 * loading/error/data state in every component.
 * @param {() => Promise<any>} fn
 * @param {any[]} deps
 */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });

  const run = useCallback(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fn()
      .then((data) => {
        if (!cancelled) setState({ data, error: null, loading: false });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, error, loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => run(), [run]);

  return { ...state, refetch: run };
}
