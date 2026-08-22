import axios from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
} from "react";
import type { User } from "@/types";
import { apiUrl } from "@/utils/api";

const DoctorsData = createContext<any>(null);
export default function DoctorsContextProvider({
  children,
  query,
  noFirstRender,
}: any) {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [doctorsData, setDoctorsData] = useState<User[] | null>(null);
  const queryKey = JSON.stringify(query ?? null);
  const fetchDoctorsData = useCallback(
    async function (setQuery?: any, noWaiting?: any) {
      const activeQuery = setQuery ? setQuery : JSON.parse(queryKey);
      await Promise.resolve();
      if (!noWaiting) setIsLoading(true);
      try {
        const { data } = await axios.request({
          url: apiUrl(
            `/doctors${
              activeQuery
                ? `?${activeQuery.total ? `total=${activeQuery.total}&` : ""}${
                    activeQuery.limit ? `limit=${activeQuery.limit}&` : ""
                  }${
                    activeQuery.specialty
                      ? `specialty=${activeQuery.specialty}&`
                      : ""
                  }${activeQuery.dname ? `dname=${activeQuery.dname}&` : ""}${
                    activeQuery.location
                      ? `location=${activeQuery.location}&`
                      : ""
                  }`
                : ""
            }`,
          ),
          ...{ timeout: 10000 },
        });
        setDoctorsData(data?.data);
        setIsError(false);
        setIsLoading(false);
        return data;
      } catch {
        setDoctorsData(null);
        setIsError(true);
        setIsLoading(false);
      }
    },
    [queryKey],
  );
  useLayoutEffect(
    function () {
      if (noFirstRender) return;
      const timeId = setTimeout(function () {
        fetchDoctorsData(
          queryKey === "null" ? undefined : JSON.parse(queryKey),
          true,
        );
      });
      return function () {
        clearTimeout(timeId);
      };
    },
    [fetchDoctorsData, noFirstRender, queryKey],
  );
  return (
    <DoctorsData.Provider
      value={{ isLoading, isError, doctorsData, fetchDoctorsData }}
    >
      {children}
    </DoctorsData.Provider>
  );
}

export function useDoctorsContext() {
  return useContext(DoctorsData);
}
