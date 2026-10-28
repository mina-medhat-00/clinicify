import {
  ClipboardList,
  Flag,
  Home,
  LogIn,
  MessageCircleQuestion,
  MessageSquare,
  Star,
  Stethoscope,
  User as UserIcon,
  UserPlus,
} from "lucide-react";
import type { ReactNode, RefObject } from "react";
import { Link, type Location, type NavigateFunction } from "react-router-dom";
import { Avatar, Skeleton } from "@/components/ui/display";
import type { MenuClickInfo, MenuItemType } from "@/components/ui/menu";
import UserItem from "@/components/layout/user-item";
import type { DoctorsHandle } from "@/pages/doctors";
import type { User } from "@/types/user";
import { doctorSpecialties } from "@/constants/sign-data";

const ALL_DOCTORS = "sub30";

function getItem(
  label: ReactNode,
  key: string,
  icon?: ReactNode,
  children?: MenuItemType[],
): MenuItemType {
  return { key, icon, children, label };
}

// Opens /doctors filtered by the clicked specialty (the item's key).
function toDoctors(
  { key }: MenuClickInfo,
  navigate: NavigateFunction,
  DoctorRef: RefObject<DoctorsHandle | null>,
) {
  const specialty = key === ALL_DOCTORS ? "" : key;
  void navigate("/doctors");
  // Wait for the doctors page to mount its filter, but give up after ~2s.
  let attempts = 0;
  const id = setInterval(function () {
    attempts += 1;
    if (attempts > 40) clearInterval(id);
    const filter = DoctorRef.current;
    if (!filter) return;
    clearInterval(id);
    const { specialtyValue, doctorName, location, setSearchFilter } = filter;
    if (specialty !== specialtyValue || doctorName || location) {
      setSearchFilter({ specialty, doctorName: "", location: "" });
    }
  }, 50);
}

function subItems() {
  return doctorSpecialties.map(function (specialty) {
    return getItem(
      <div className="text-white font-normal select-none">{specialty}</div>,
      specialty,
    );
  });
}

export default function items({
  navigate,
  location,
  DoctorRef,
  user,
  isUserLoading,
}: {
  navigate: NavigateFunction;
  location: Location;
  DoctorRef: RefObject<DoctorsHandle | null>;
  user: User | null;
  isUserLoading: boolean;
}): (MenuItemType | null)[] {
  function openDoctors(info: MenuClickInfo) {
    toDoctors(info, navigate, DoctorRef);
  }
  return [
    user || isUserLoading
      ? getItem(
          <UserItem />,
          "user",
          isUserLoading ? (
            <Skeleton.Avatar active />
          ) : user?.img_url ? (
            <Avatar src={user.img_url} size="small" />
          ) : (
            <UserIcon className="size-6 text-gray-200 m-0" />
          ),
        )
      : null,
    location.pathname !== "/"
      ? getItem(
          <Link to="/" className="select-none">
            Home Page
          </Link>,
          "1",
          <Home className="size-4 text-gray-300 hover:text-white" />,
        )
      : null,
    !user && !isUserLoading
      ? getItem(
          <Link to="/login" className="select-none">
            Login
          </Link>,
          "login",
          <LogIn className="size-4 text-gray-300 hover:text-white" />,
        )
      : null,
    !user && !isUserLoading
      ? getItem(
          <Link to="/signup" className="select-none">
            Sign Up
          </Link>,
          "signup",
          <UserPlus className="size-4 text-gray-300 hover:text-white" />,
        )
      : null,
    user && user.user_type !== "admin"
      ? getItem(
          <Link to="/appointments" className="select-none">
            My Appointment
          </Link>,
          "2",
          <ClipboardList className="size-4 text-gray-300 hover:text-white" />,
        )
      : null,
    getItem(
      <span className="text-gray-300 hover:text-white select-none">
        Doctors
      </span>,
      "subdoc3",
      <Stethoscope className="-ml-1 size-4 text-gray-300 hover:text-white" />,
      [
        {
          ...getItem(
            <div className="text-white font-semibold select-none">
              All Doctors
            </div>,
            ALL_DOCTORS,
          ),
          onClick: openDoctors,
        },
        {
          ...getItem(
            <span className="font-medium text-white">Specialty</span>,
            "sub31",
            null,
            subItems(),
          ),
          onClick: openDoctors,
        },
      ],
    ),
    user
      ? getItem(
          <Link to="/chat" className="select-none">
            Chatting
          </Link>,
          "4",
          <MessageSquare className="size-4 text-gray-300 hover:text-white" />,
        )
      : null,
    getItem(
      <Link to="/posts" className="select-none">
        Questions
      </Link>,
      "5",
      <MessageCircleQuestion className="size-4 text-gray-300 hover:text-white" />,
    ),
    getItem(
      <Link to="/feedbacks" className="select-none">
        Feedbacks
      </Link>,
      "7",
      <Star className="size-4 text-gray-300 hover:text-white" />,
    ),
    user
      ? getItem(
          <Link to="/report/problem" className="select-none">
            Report a problem
          </Link>,
          "report",
          <Flag className="size-4 text-gray-300 hover:text-white" />,
        )
      : null,
  ];
}
