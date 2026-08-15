import axios from "axios";
import { createContext, useContext, useLayoutEffect, useState } from "react";
import type { User } from "@/types";

const UsersData = createContext<any>(null);
const UsersContextProvider = ({ children }: any) => {
  const [isLoading, setIsLoading] = useState(true);
  const [usersData, setUsersData] = useState<User[] | null>(null);
  const [isError, setIsError] = useState(false);
  const host = window?.location?.hostname;
  const fetchUsersData = async (notWaiting?: any, ..._args: any[]) => {
    if (!notWaiting) setIsLoading(true);
    setIsError(false);
    try {
      const { data } = await axios.request({
        url: `http://${host}:5000/users`,
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
  };
  useLayoutEffect(() => {
    fetchUsersData();
  }, []);
  return (
    <UsersData.Provider
      value={{ isLoading, usersData, isError, fetchUsersData }}
    >
      {children}
    </UsersData.Provider>
  );
};

export default UsersContextProvider;

export const useUsersContext = () => useContext(UsersData);
