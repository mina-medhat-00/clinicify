import axios from "axios";
import { createContext, useContext, useState } from "react";
import type { ProfileData } from "@/types";
import { apiUrl } from "@/utils/api";

const ProfileData = createContext<any>(null);
export default function ProfileContextProvider({ children }: any) {
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [isError, setIsError] = useState(false);
  async function fetchProfileData(
    { path, username }: any,
    notWaiting?: any,
    ..._args: any[]
  ) {
    if (!notWaiting) setIsLoading(true);
    setIsError(false);
    try {
      const { data } = await axios.request({
        url: apiUrl(`/${path}/${username}`),
        ...{ timeout: 8000 },
      });
      setProfileData(data?.data);
      setIsLoading(false);
      return data;
    } catch (err) {
      setIsLoading(false);
      if (err?.response?.status !== 400) setIsError(true);
    }
  }
  return (
    <ProfileData.Provider
      value={{ isLoading, profileData, isError, fetchProfileData }}
    >
      {children}
    </ProfileData.Provider>
  );
}

export function useProfileContext() {
  return useContext(ProfileData);
}
