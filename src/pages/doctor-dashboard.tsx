import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import DashNav from "@/components/dashboard/dash-nav";
import ScheduleAppointments from "@/components/dashboard/schedule-appointments";
import {
  ChatContextProvider,
  ProfileContextProvider,
  SlotsContextProvider,
} from "@/contexts";
import AppointmentContextProvider from "@/contexts/appointment-context";
import { useDashboardContext } from "@/contexts/dashboard-context";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";
import Appointments from "@/pages/appointments";
import Chat from "@/pages/chat";
import UserProfile from "@/pages/user-profile";

export default function DoctorDashboard({ setNavActive }: any) {
  const { timeZone, socket } = useUtilsContext();
  const { userData: user, fetchUserData } = useUserContext();
  const userid = user?.user_id;
  // The dashboard provider loads its data on mount.
  const { dashboardData, isLoading } = useDashboardContext();
  const isMobile = useMediaQuery({
    query: "(max-width:678px)",
  });
  const [dashType, setDashType] = useState(
    window.localStorage.getItem("dashType") || "profile",
  );
  useEffect(
    function () {
      window.localStorage.setItem("dashType", dashType);
      if (dashType == "chat") setNavActive(false);
      else setNavActive(true);
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
    <div className={`${isMobile ? "flex" : ""} grow overflow-hidden  w-full`}>
      <DashNav setDashType={setDashType} dashType={dashType} />
      <div className="grow overflow-hidden">
        {dashType == "profile" ? (
          <div className="flex flex-col h-full grow overflow-hidden">
            <ProfileContextProvider>
              <UserProfile />
            </ProfileContextProvider>
          </div>
        ) : dashType == "schedule" ? (
          <div className="bg-white h-full">
            <SlotsContextProvider>
              <ScheduleAppointments
                isDoctorLoading={isLoading}
                socket={socket}
                doctorData={dashboardData}
                setDashType={setDashType}
                offsetWidth={100}
                buttonLabel="Schedule"
                userid={userid}
                timeZone={timeZone}
                fetchUserData={fetchUserData}
              />
            </SlotsContextProvider>
          </div>
        ) : dashType == "appointments" ? (
          <AppointmentContextProvider isDoctor={true}>
            <Appointments fromDash={true} />
          </AppointmentContextProvider>
        ) : dashType == "chat" ? (
          <ChatContextProvider>
            <Chat />
          </ChatContextProvider>
        ) : dashType == "statistics" ? (
          <div>statistics</div>
        ) : null}
      </div>
    </div>
  );
}
