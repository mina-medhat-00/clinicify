import { useCallback, useEffect, useState } from "react";
import { useUserContext } from "@/contexts/user-context";
import { errorStatus, getToken } from "@/services/client";
import type { RemoteDataOptions, LoadOptions } from "@/types/api";
// Data and loading and error state for one API resource with expired sessions handed to the user context
export function useRemoteData<T, Q = undefined>(
  request: (query: Q) => Promise<T>,
  {
    requiresAuth,
    autoLoad = false,
    emptyOn,
    initialLoading = true,
  }: RemoteDataOptions<Q> = {},
) {
  const { handleSessionError } = useUserContext();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [isError, setIsError] = useState(false);
  const emptyKey = (emptyOn ?? []).join(",");

  // Request alone without state changes so effects can start it directly
  const fetchData = useCallback(
    async function (query: Q) {
      if (requiresAuth && !getToken()) return null;
      return request(query);
    },
    [request, requiresAuth],
  );

  // Store the outcome once the request settles
  const settle = useCallback(
    function (pending: Promise<T | null>) {
      return pending.then(
        function (result) {
          setData(result);
          setIsError(false);
          setIsLoading(false);
          return result;
        },
        function (err: unknown) {
          setData(null);
          const status = String(errorStatus(err));
          const isEmpty = emptyKey.split(",").includes(status);
          if (!isEmpty && !handleSessionError(err)) setIsError(true);
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

  // Compare by value so an inline query doesn't refetch every render
  const autoKey = autoLoad ? JSON.stringify(autoLoad.query ?? null) : null;
  useEffect(
    function () {
      if (autoKey === null) return;
      const query = (JSON.parse(autoKey) as Q | null) ?? (undefined as Q);
      void settle(fetchData(query));
    },
    [autoKey, fetchData, settle],
  );

  return { data, setData, isLoading, isError, load };
}
