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

const UsersData = createContext<any>(null);
export default function UsersContextProvider({ children }: any) {
  const [isLoading, setIsLoading] = useState(true);
  const [usersData, setUsersData] = useState<User[] | null>(null);
  const [isError, setIsError] = useState(false);
  const fetchUsersData = useCallback(async function (notWaiting?: any) {
    await Promise.resolve();
    if (!notWaiting) setIsLoading(true);
    setIsError(false);
    try {
      const { data } = await axios.request({
        url: apiUrl("/users"),
        ...{
          timeout: 8000,
        },
      });
      setUsersData(data?.data);
      setIsLoading(false);
      return data;
    } catch {
      setIsLoading(false);
      setIsError(true);
    }
  }, []);
  useLayoutEffect(
    function () {
      const timeId = setTimeout(function () {
        fetchUsersData(true);
      });
      return function () {
        clearTimeout(timeId);
      };
    },
    [fetchUsersData],
  );
  return (
    <UsersData.Provider
      value={{ isLoading, usersData, isError, fetchUsersData }}
    >
      {children}
    </UsersData.Provider>
  );
}

export function useUsersContext() {
  return useContext(UsersData);
}
