import type { ReactNode } from "react";
import { createStrictContext } from "@/utils/create-strict-context";
import { useRemoteData } from "@/hooks/use-remote-data";
import { apiGet } from "@/services/client";
import type { Id } from "@/types/user";
import type { ProfileData } from "@/types/clinic";

// Accepts a username or a user id.
function getProfile(user: string | Id) {
  return apiGet<ProfileData>(`/profile/${encodeURIComponent(user)}`);
}

function useProfileValue() {
  const {
    data: profileData,
    isLoading,
    isError,
    load: fetchProfileData,
    // 400 = no such user: show "cannot find any profile", not an error page.
  } = useRemoteData(getProfile, { emptyOn: [400] });
  return { isLoading, profileData, isError, fetchProfileData };
}

const [ProfileData, useProfileContext] =
  createStrictContext<ReturnType<typeof useProfileValue>>("ProfileContext");
export { useProfileContext };

export default function ProfileContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const value = useProfileValue();
  return <ProfileData.Provider value={value}>{children}</ProfileData.Provider>;
}
