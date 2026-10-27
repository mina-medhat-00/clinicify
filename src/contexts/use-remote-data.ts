import { useCallback, useEffect, useState } from "react";
import { useUserContext } from "@/contexts/user-context";
import { errorStatus, getToken, type LoadOptions } from "@/services/client";

type Options<Q> = {
  // Skip the request (and show nothing) when nobody is signed in.
  requiresAuth?: boolean;
  // Load on mount (and when the query changes); omit to load manually.
  autoLoad?: { query?: Q } | false;
  // Statuses that mean "nothing here" rather than an error (e.g. 400 = not found).
  emptyOn?: number[];
  initialLoading?: boolean;
};

// Shared state for one API resource: data, loading and error flags, and a
// `load(query, { silent })` function. An expired session is handed to the
// user context, which signs the user out.
export function useRemoteData<T, Q = void>(
  request: (query: Q) => Promise<T>,
  {
    requiresAuth,
    autoLoad = false,
    emptyOn,
    initialLoading = true,
  }: Options<Q> = {},
) {
  const { handleSessionError } = useUserContext() ?? {};
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [isError, setIsError] = useState(false);
  const emptyKey = (emptyOn ?? []).join(",");

  // The request alone, with no state changes, so effects can start it directly.
  const fetchData = useCallback(
    async function (query: Q) {
      if (requiresAuth && !getToken()) return null;
      return request(query);
    },
    [request, requiresAuth],
  );

  // Store the outcome once the request settles.
  const settle = useCallback(
    function (pending: Promise<T | null>) {
      return pending.then(
        function (result) {
          setData(result);
          setIsError(false);
          setIsLoading(false);
          return result;
        },
        function (err) {
          setData(null);
          const status = String(errorStatus(err));
          const isEmpty = emptyKey.split(",").includes(status);
          if (!isEmpty && !handleSessionError?.(err)) setIsError(true);
          setIsLoading(false);
          return null;
        },
      );
    },
    [emptyKey, handleSessionError],
  );

  const load = useCallback(
    function (query: Q, { silent }: LoadOptions = {}) {
      if (!silent) setIsLoading(true);
      return settle(fetchData(query));
    },
    [fetchData, settle],
  );

  // Compare by value so an inline query object doesn't refetch every render.
  const autoKey = autoLoad ? JSON.stringify(autoLoad.query ?? null) : null;
  useEffect(
    function () {
      if (autoKey === null) return;
      settle(fetchData(JSON.parse(autoKey) ?? undefined));
    },
    [autoKey, fetchData, settle],
  );

  return { data, setData, isLoading, isError, load };
}
