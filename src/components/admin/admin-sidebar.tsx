import {
  Flag,
  Home,
  LayoutDashboard,
  Mail,
  MessageCircleQuestion,
  Shield,
  Stethoscope,
  UserCheck,
  UserCog,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { AdminDashType } from "@/constants/dash-types";

interface SidebarLink {
  key: string;
  value: string;
  icon: ReactNode;
}

// Dashboard links switch the admin tab; general links leave the dashboard.
const dashboardLinks: (SidebarLink & { key: AdminDashType })[] = [
  { key: "profile", value: "My Profile", icon: <Shield /> },
  { key: "user", value: "Users Management", icon: <UserCheck /> },
  { key: "doctor", value: "Doctors Management", icon: <UserCog /> },
  { key: "chat", value: "Chatting", icon: <Mail /> },
  { key: "reports", value: "Reports", icon: <Flag /> },
];
const generalLinks: (SidebarLink & { link: string })[] = [
  { link: "", key: "home", value: "Home", icon: <Home /> },
  { link: "doctors", key: "doctors", value: "Doctors", icon: <Stethoscope /> },
  {
    link: "posts",
    key: "posts",
    value: "Questions",
    icon: <MessageCircleQuestion />,
  },
];

export default function Sidebar({
  activeMenu,
  setActiveMenu,
  isMobile,
  setDashType,
  dashType,
}: {
  activeMenu: boolean;
  setActiveMenu: (active: boolean) => void;
  isMobile: boolean;
  setDashType: (type: AdminDashType) => void;
  dashType: AdminDashType;
}) {
  function handleCloseSideBar(value?: AdminDashType) {
    if (value) setDashType(value);
    if (isMobile) setActiveMenu(false);
  }

  const activeLink =
    "flex items-center gap-5 px-4 pt-3 pb-2.5 rounded-lg text-white bg-blue-700 text-md m-2";
  const normalLink =
    "flex items-center gap-5 px-4 pt-3 pb-2.5 rounded-lg text-md text-gray-700 dark:text-gray-200 dark:hover:text-black hover:bg-gray-100 m-2";

  return (
    <div className="ml-3 h-screen md:overflow-hidden overflow-auto md:hover:overflow-auto pb-10">
      {activeMenu && (
        <>
          <div className="flex justify-between items-center">
            <div
              onClick={function () {
                handleCloseSideBar("profile");
              }}
              className="transition-all duration-500 cursor-pointer hover:text-blue-500 items-center gap-3 ml-3 mt-4 flex text-xl font-extrabold tracking-tight dark:text-white text-slate-900"
            >
              <LayoutDashboard />
              <span>Admin</span>
            </div>
            <button
              type="button"
              onClick={function () {
                setActiveMenu(!activeMenu);
              }}
              className="text-xl text-gray-700 rounded-full p-3 hover:bg-gray-200 mt-4 block md:hidden"
            >
              <X />
            </button>
          </div>
          <div className="mt-10">
            <p className="text-gray-400 dark:text-gray-400 m-3 mt-4 uppercase">
              Dashboard
            </p>
            {dashboardLinks.map(function (link) {
              return (
                <button
                  type="button"
                  key={link.key}
                  onClick={function () {
                    handleCloseSideBar(link.key);
                  }}
                  className={link.key === dashType ? activeLink : normalLink}
                >
                  {link.icon}
                  <span className="capitalize">{link.value}</span>
                </button>
              );
            })}
            <p className="text-gray-400 dark:text-gray-400 m-3 mt-4 uppercase">
              General
            </p>
            {generalLinks.map(function (link) {
              return (
                <Link
                  to={`/${link.link}`}
                  key={link.key}
                  onClick={function () {
                    handleCloseSideBar();
                  }}
                  className={normalLink}
                >
                  {link.icon}
                  <span className="capitalize">{link.value}</span>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
