"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Petit hook de récupération de données : gère loading / erreur / retry.
 * Les mises à jour d'état se font uniquement dans les callbacks de la
 * promesse (jamais synchroniquement dans l'effet).
 */
export function useData<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetcher()
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setError(null);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Une erreur est survenue.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  return { data, loading, error, retry };
}
