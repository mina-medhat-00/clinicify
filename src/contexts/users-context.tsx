import type { ReactNode } from "react";
import { createStrictContext } from "@/utils/create-strict-context";
import { useRemoteData } from "@/hooks/use-remote-data";
import { apiGet } from "@/services/client";
import type { ManagedUser } from "@/types/user";

function getUsers() {
  return apiGet<ManagedUser[]>("/users");
}

function useUsersValue() {
  const {
    data: usersData,
    isLoading,
    isError,
    load: fetchUsersData,
  } = useRemoteData(getUsers, { autoLoad: {} });
  return { isLoading, usersData, isError, fetchUsersData };
}

const [UsersData, useUsersContext] =
  createStrictContext<ReturnType<typeof useUsersValue>>("UsersContext");
export { useUsersContext };

export default function UsersContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const value = useUsersValue();
  return <UsersData.Provider value={value}>{children}</UsersData.Provider>;
}
