import { Avatar, Skeleton } from "@/components/ui/kit";
import {
  ClipboardList,
  Flag,
  Home,
  LogIn,
  MessageCircleQuestion,
  MessageSquare,
  Star,
  Stethoscope,
  User,
  UserPlus,
} from "lucide-react";
import { Link } from "react-router-dom";
import UserItem from "@/components/layout/user-item";
import { doctorSpecialties } from "@/utils/sign-data";

function getItem(
  label?: any,
  key?: any,
  icon?: any,
  children?: any,
  type?: any,
  ..._args: any[]
) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}
function toDoctors(
  val?: any,
  navigate?: any,
  DoctorRef?: any,
  ..._args: any[]
) {
  let specialty = val.domEvent.target.getAttribute("specialty");
  navigate("/doctors");
  const id = setInterval(function () {
    if (DoctorRef?.current) {
      clearInterval(id);
      const { specialtyValue, doctorName, location, setSearchFilter } =
        DoctorRef.current;
      specialty = specialty == "all" ? "" : specialty;
      if (specialty != specialtyValue || doctorName || location) {
        setSearchFilter({ specialty, doctorName: "", location: "" });
      }
    }
  });
}
function subItems() {
  return doctorSpecialties.map(function (specialty) {
    return getItem(
      <div className="text-white font-normal select-none" specialty={specialty}>
        {specialty}
      </div>,
      specialty,
    );
  });
}

function items(
  navigate?: any,
  location?: any,
  DoctorRef?: any,
  user?: any,
  messageApi?: any,
  setUserData?: any,
  isMobile?: any,
  isUserLoading?: any,
) {
  return [
    user || isUserLoading
      ? getItem(
          <UserItem isMobile={isMobile} />,
          "user",
          isUserLoading ? (
            <Skeleton.Avatar active />
          ) : user?.img_url ? (
            <Avatar src={user?.img_url} size="small" />
          ) : (
            <User className="size-6 text-gray-200 m-0" />
          ),
        )
      : null,
    !(location.pathname == "/")
      ? getItem(
          <Link to="/" className="select-none">
            {"Home Page"}
          </Link>,
          "1",
          <Home className="size-4 text-gray-300 hover:text-white" />,
        )
      : null,
    !user && !isUserLoading
      ? getItem(
          <Link to="/login" className="select-none">
            {"Login"}
          </Link>,
          "login",
          <LogIn className="size-4 text-gray-300 hover:text-white" />,
        )
      : null,
    !user && !isUserLoading
      ? getItem(
          <Link to="/signup" className="select-none">
            {"Sign Up"}
          </Link>,
          "signup",
          <UserPlus className="size-4 text-gray-300 hover:text-white" />,
        )
      : null,
    user && user?.user_type !== "admin"
      ? getItem(
          <Link to="/appointments" className="select-none">
            {"My Appointment"}
          </Link>,
          "2",
          <ClipboardList className="size-4 text-gray-300 hover:text-white" />,
        )
      : null,
    getItem(
      <span className="text-gray-300 hover:text-white select-none">
        {"Doctors"}
      </span>,
      "subdoc3",
      <Stethoscope className="-ml-1 size-4 text-gray-300 hover:text-white" />,
      [
        {
          ...getItem(
            <div
              className="text-white font-semibold select-none"
              specialty="all"
            >
              {"All Doctors"}
            </div>,
            "sub30",
          ),
          onClick: function (val?: any, ..._args: any[]) {
            toDoctors(val, navigate, DoctorRef);
          },
        },
        {
          ...getItem(
            <span className="font-medium text-white">{"Specialty"}</span>,
            "sub31",
            null,
            subItems(),
          ),
          onClick: function (val?: any, ..._args: any[]) {
            toDoctors(val, navigate, DoctorRef);
          },
        },
      ],
    ),
    user
      ? getItem(
          <Link to="/chat" className="select-none">
            {"Chatting"}
          </Link>,
          "4",
          <MessageSquare className="size-4 text-gray-300 hover:text-white" />,
        )
      : null,
    getItem(
      <Link to="/posts" className="select-none">
        {"Questions"}
      </Link>,
      "5",
      <MessageCircleQuestion className="size-4 text-gray-300 hover:text-white" />,
    ),
    getItem(
      <Link to="/feedbacks" className="select-none">
        {"Feedbacks"}
      </Link>,
      "7",
      <Star className="size-4 text-gray-300 hover:text-white" />,
    ),
    user
      ? getItem(
          <Link to="/report/problem" className="select-none">
            {"Report a problem"}
          </Link>,
          "report",
          <Flag className="size-4 text-gray-300 hover:text-white" />,
        )
      : null,
  ];
}

export default items;
