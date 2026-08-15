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

const AdminDashboard = () => {
  const isMobile = useMediaQuery({
    query: "(max-width:878px)",
  });
  const { timeZone, socket, messageApi } = useUtilsContext();
  const { fetchUserData, isLoading, userData: user } = useUserContext();
  const [activeMenu, setActiveMenu] = useState(false);
  const [dashType, setDashType] = useState(
    window.localStorage.getItem("adminDashType"),
  );
  useEffect(() => {
    if (dashType) window.localStorage.setItem("adminDashType", dashType);
  }, [dashType]);
  return (
    <div>
      <div className="flex relative dark:bg-main-dark-bg">
        {activeMenu ? (
          <div className="sidebar fixed w-full bg-white shadow-[0_7px_30px_rgb(113_122_131/11%)] max-[800px]:z-1000 sm:w-64 dark:bg-secondary-dark-bg ">
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
            <div className="navbar fixed z-1000 w-full bg-main-bg md:static dark:bg-main-dark-bg ">
              <Navbar
                user={user}
                dashType={dashType}
                isMobile={isMobile}
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
            <ChatContextProvider fetchUserData={fetchUserData}>
              <Chat
                isAdmin={true}
                user={user}
                fetchUserData={fetchUserData}
                messageApi={messageApi}
                socket={socket}
                timeZone={timeZone}
              />
            </ChatContextProvider>
          ) : dashType == "profile" ? (
            <ProfileContextProvider>
              <UserProfile
                isUserLoading={isLoading}
                socket={socket}
                fetchUserData={fetchUserData}
                timeZone={timeZone}
                userid={user?.user_id}
              />
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
};
export default AdminDashboard;
