import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import Navbar from "@/components/admin/admin-navbar";
import AdminReports from "@/components/admin/admin-reports";
import Sidebar from "@/components/admin/admin-sidebar";
import DoctorManagement from "@/components/admin/doctor-management";
import UserManagement from "@/components/admin/user-management";
import {
  ChatContextProvider,
  DoctorsContextProvider,
  ProfileContextProvider,
  UsersContextProvider,
} from "@/contexts";
import ReportContextProvider from "@/contexts/report-context";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";
import Chat from "@/pages/chat";
import UserProfile from "@/pages/user-profile";

export default function AdminDashboard() {
  const isMobile = useMediaQuery({
    query: "(max-width:878px)",
  });
  const { timeZone, socket } = useUtilsContext();
  const { userData: user } = useUserContext();
  const [activeMenu, setActiveMenu] = useState(false);
  // Open the sidebar on desktop and close it on mobile whenever the size changes.
  const [prevIsMobile, setPrevIsMobile] = useState<boolean | null>(null);
  if (prevIsMobile !== isMobile) {
    setPrevIsMobile(isMobile);
    setActiveMenu(!isMobile);
  }
  // Open the profile section on first visit instead of a blank page.
  const [dashType, setDashType] = useState(
    window.localStorage.getItem("adminDashType") || "profile",
  );
  useEffect(
    function () {
      if (dashType) window.localStorage.setItem("adminDashType", dashType);
    },
    [dashType],
  );
  return (
    <div>
      <div className="flex relative dark:bg-main-dark-bg">
        {activeMenu ? (
          <div className="sidebar fixed w-full bg-white shadow-lg max-lg:z-50 sm:w-64 dark:bg-secondary-dark-bg ">
            <Sidebar
              user={user}
              setDashType={setDashType}
              dashType={dashType}
              isMobile={isMobile}
              setActiveMenu={setActiveMenu}
              activeMenu={activeMenu}
            />
          </div>
        ) : (
          <div className="w-0 dark:bg-secondary-dark-bg">
            <Sidebar
              user={user}
              setDashType={setDashType}
              dashType={dashType}
              isMobile={isMobile}
              setActiveMenu={setActiveMenu}
              activeMenu={activeMenu}
            />
          </div>
        )}
        <div
          className={
            activeMenu
              ? "dark:bg-main-dark-bg  bg-main-bg min-h-screen md:ml-64 w-full  "
              : "bg-main-bg dark:bg-main-dark-bg  w-full min-h-screen flex-2 "
          }
        >
          <div className="mb-16 md:mb-0">
            <div className="navbar fixed z-50 w-full bg-main-bg md:static dark:bg-main-dark-bg ">
              <Navbar
                user={user}
                dashType={dashType}
                setDashType={setDashType}
                setActiveMenu={setActiveMenu}
                activeMenu={activeMenu}
              />
            </div>
          </div>
          {dashType == "doctor" ? (
            <DoctorsContextProvider query={{ total: true }}>
              <DoctorManagement socket={socket} timeZone={timeZone} />
            </DoctorsContextProvider>
          ) : dashType == "user" ? (
            <UsersContextProvider>
              <DoctorsContextProvider query={{ total: true }}>
                <UserManagement socket={socket} />
              </DoctorsContextProvider>
            </UsersContextProvider>
          ) : dashType == "chat" ? (
            <ChatContextProvider>
              <Chat />
            </ChatContextProvider>
          ) : dashType == "profile" ? (
            <ProfileContextProvider>
              <UserProfile />
            </ProfileContextProvider>
          ) : dashType == "reports" ? (
            <ReportContextProvider>
              <AdminReports />
            </ReportContextProvider>
          ) : null}
        </div>
      </div>
    </div>
  );
}
