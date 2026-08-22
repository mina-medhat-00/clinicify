import axios from "axios";
import { createContext, useContext, useLayoutEffect, useState } from "react";
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
  async function fetchDoctorsData(
    setQuery?: any,
    noWaiting?: any,
    ..._args: any[]
  ) {
    const activeQuery = setQuery ? setQuery : query;
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
    } catch (err) {
      setDoctorsData(null);
      setIsError(true);
      setIsLoading(false);
    }
  }
  useLayoutEffect(function () {
    if (!noFirstRender) fetchDoctorsData(query);
  }, []);
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
