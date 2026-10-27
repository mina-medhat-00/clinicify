import { createContext, useContext } from "react";
import { useRemoteData } from "@/contexts/use-remote-data";
import { api } from "@/services/client";
import type { ProfileData } from "@/types";

// Accepts a username or a user id.
async function getProfile(user: string | number) {
  const { data } = await api.get(`/profile/${encodeURIComponent(user)}`);
  return data?.data as ProfileData;
}

const ProfileDataContext = createContext<any>(null);
export default function ProfileContextProvider({ children }: any) {
  const {
    data: profileData,
    isLoading,
    isError,
    load: fetchProfileData,
    // 400 = no such user: show "cannot find any profile", not an error page.
  } = useRemoteData(getProfile, { emptyOn: [400] });
  return (
    <ProfileDataContext.Provider
      value={{ isLoading, profileData, isError, fetchProfileData }}
    >
      {children}
    </ProfileDataContext.Provider>
  );
}

export function useProfileContext() {
  return useContext(ProfileDataContext);
}
