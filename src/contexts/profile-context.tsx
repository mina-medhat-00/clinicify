import axios from "axios";
import { createContext, useContext, useState } from "react";
import type { ProfileData } from "@/types";

const ProfileData = createContext<any>(null);
const ProfileContextProvider = ({ children }: any) => {
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [isError, setIsError] = useState(false);
  const host = window?.location?.hostname;
  const fetchProfileData = async (
    { path, username }: any,
    notWaiting?: any,
    ..._args: any[]
  ) => {
    if (!notWaiting) setIsLoading(true);
    setIsError(false);
    try {
      const { data } = await axios.request({
        url: `http://${host}:5000/${path}/${username}`,
        ...{ timeout: 8000 },
      });
      setProfileData(data?.data);
      setIsLoading(false);
      return data;
    } catch (err) {
      setIsLoading(false);
      if (err?.response?.status !== 400) setIsError(true);
    }
  };
  return (
    <ProfileData.Provider
      value={{ isLoading, profileData, isError, fetchProfileData }}
    >
      {children}
    </ProfileData.Provider>
  );
};

export default ProfileContextProvider;

export const useProfileContext = () => useContext(ProfileData);
