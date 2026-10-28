import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useMediaQuery } from "react-responsive";
import DashNav from "@/components/dashboard/dash-nav";
import DoctorStatisticsView from "@/components/dashboard/doctor-statistics";
import ScheduleAppointments from "@/components/dashboard/schedule-appointments";
import ChatContextProvider from "@/contexts/chat-context";
import ProfileContextProvider from "@/contexts/profile-context";
import SlotsContextProvider from "@/contexts/slots-context";
import AppointmentContextProvider from "@/contexts/appointment-context";
import { useDashboardContext } from "@/contexts/dashboard-context";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";
import Appointments from "@/pages/appointments";
import Chat from "@/pages/chat";
import UserProfile from "@/pages/user-profile";
import { doctorDashTypes, type DoctorDashType } from "@/constants/dash-types";
import { readStoredChoice, storeChoice } from "@/utils/storage";

export default function DoctorDashboard({
  setNavActive,
}: {
  setNavActive: Dispatch<SetStateAction<boolean>>;
}) {
  const { timeZone, socket } = useUtilsContext();
  const { userData: user, fetchUserData } = useUserContext();
  const userid = user?.user_id;
  // The dashboard provider loads its data on mount.
  const { dashboardData, isLoading } = useDashboardContext();
  const isMobile = useMediaQuery({
    query: "(max-width:678px)",
  });
  const [dashType, setDashType] = useState<DoctorDashType>(function () {
    return readStoredChoice("dashType", doctorDashTypes, "profile");
  });
  useEffect(
    function () {
      storeChoice("dashType", dashType);
      setNavActive(dashType !== "chat");
    },
    [dashType, setNavActive],
  );
  useEffect(
    function () {
      return function () {
        setNavActive(true);
      };
    },
    [setNavActive],
  );
  return (
    <div className={`${isMobile ? "flex" : ""} grow overflow-hidden w-full`}>
      <DashNav setDashType={setDashType} dashType={dashType} />
      <div className="grow overflow-hidden">
        {dashType === "profile" ? (
          <div className="flex flex-col h-full grow overflow-hidden">
            <ProfileContextProvider>
              <UserProfile />
            </ProfileContextProvider>
          </div>
        ) : dashType === "schedule" ? (
          <div className="bg-white h-full">
            <SlotsContextProvider>
              <ScheduleAppointments
                isDoctorLoading={isLoading}
                socket={socket}
                doctorData={dashboardData}
                setDashType={setDashType}
                offsetWidth={100}
                userid={userid}
                timeZone={timeZone}
                fetchUserData={fetchUserData}
              />
            </SlotsContextProvider>
          </div>
        ) : dashType === "appointments" ? (
          <AppointmentContextProvider isDoctor={true}>
            <Appointments fromDash={true} />
          </AppointmentContextProvider>
        ) : dashType === "chat" ? (
          <ChatContextProvider>
            <Chat />
          </ChatContextProvider>
        ) : (
          <DoctorStatisticsView
            statistics={dashboardData?.statistics}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
