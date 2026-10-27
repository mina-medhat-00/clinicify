import { createContext, useContext } from "react";
import { useRemoteData } from "@/contexts/use-remote-data";
import { api } from "@/services/client";
import type { User } from "@/types";

async function getUsers() {
  const { data } = await api.get("/users");
  return data?.data as User[];
}

const UsersData = createContext<any>(null);
export default function UsersContextProvider({ children }: any) {
  const {
    data: usersData,
    isLoading,
    isError,
    load: fetchUsersData,
  } = useRemoteData(getUsers, { autoLoad: {} });
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
