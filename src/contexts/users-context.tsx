import axios from "axios";
import { createContext, useContext, useLayoutEffect, useState } from "react";
import type { User } from "@/types";
import { apiUrl } from "@/utils/api";

const UsersData = createContext<any>(null);
function UsersContextProvider({ children }: any) {
  const [isLoading, setIsLoading] = useState(true);
  const [usersData, setUsersData] = useState<User[] | null>(null);
  const [isError, setIsError] = useState(false);
  async function fetchUsersData(notWaiting?: any, ..._args: any[]) {
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
    } catch (err) {
      setIsLoading(false);
      setIsError(true);
    }
  }
  useLayoutEffect(function () {
    fetchUsersData();
  }, []);
  return (
    <UsersData.Provider
      value={{ isLoading, usersData, isError, fetchUsersData }}
    >
      {children}
    </UsersData.Provider>
  );
}

export default UsersContextProvider;

export function useUsersContext() {
  return useContext(UsersData);
}
