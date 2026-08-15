import { HomeOutlined } from "@ant-design/icons";
import { Avatar, Skeleton } from "antd";
import { AiOutlineLogin } from "react-icons/ai";
import { GiArchiveRegister, GiDoctorFace } from "react-icons/gi";
import { ImProfile } from "react-icons/im";
import { MdQuestionAnswer, MdReportProblem, MdReviews } from "react-icons/md";
import { SiGnuprivacyguard } from "react-icons/si";
import { TiMessages } from "react-icons/ti";
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
const toDoctors = (
  val?: any,
  navigate?: any,
  DoctorRef?: any,
  ..._args: any[]
) => {
  let specialty = val.domEvent.target.getAttribute("specialty");
  navigate("/doctors");
  let id = setInterval(() => {
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
};
const subItems = () =>
  doctorSpecialties.map((specialty) =>
    getItem(
      <div className="text-white font-base select-none" specialty={specialty}>
        {specialty}
      </div>,
      specialty,
    ),
  );

const items = (
  navigate?: any,
  location?: any,
  DoctorRef?: any,
  user?: any,
  messageApi?: any,
  setUserData?: any,
  isMobile?: any,
  isUserLoading?: any,
) => [
  user || isUserLoading
    ? getItem(
        <UserItem isMobile={isMobile} />,
        "user",
        isUserLoading ? (
          <Skeleton.Avatar active />
        ) : user?.img_url ? (
          <Avatar src={user?.img_url} size="small" />
        ) : (
          <ImProfile className="text-2xl text-gray-200 m-0" />
        ),
      )
    : null,
  !(location.pathname == "/")
    ? getItem(
        <Link to="/" className="select-none">
          {"Home Page"}
        </Link>,
        "1",
        <HomeOutlined className="text-gray-300 hover:text-white" />,
      )
    : null,
  !user && !isUserLoading
    ? getItem(
        <Link to="/login" className="select-none">
          {"Login"}
        </Link>,
        "login",
        <AiOutlineLogin className="text-gray-300 hover:text-white" />,
      )
    : null,
  !user && !isUserLoading
    ? getItem(
        <Link to="/signup" className="select-none">
          {"Sign Up"}
        </Link>,
        "signup",
        <SiGnuprivacyguard className="text-gray-300 hover:text-white" />,
      )
    : null,
  user && user?.user_type !== "admin"
    ? getItem(
        <Link to="/appointments" className="select-none">
          {"My Appointment"}
        </Link>,
        "2",
        <GiArchiveRegister className="text-gray-300 hover:text-white" />,
      )
    : null,
  getItem(
    <span className="text-gray-300 hover:text-white select-none">
      {"Doctors"}
    </span>,
    "subdoc3",
    <GiDoctorFace className="-ml-1 text-gray-300 hover:text-white" />,
    [
      {
        ...getItem(
          <div className="text-white font-semibold select-none" specialty="all">
            {"All Doctors"}
          </div>,
          "sub30",
        ),
        onClick: (val?: any, ..._args: any[]) =>
          toDoctors(val, navigate, DoctorRef),
      },
      {
        ...getItem(
          <span className="font-medium text-white">{"Specialty"}</span>,
          "sub31",
          null,
          subItems(),
        ),
        onClick: (val?: any, ..._args: any[]) =>
          toDoctors(val, navigate, DoctorRef),
      },
    ],
  ),
  user
    ? getItem(
        <Link to="/chat" className="select-none">
          {"Chatting"}
        </Link>,
        "4",
        <TiMessages className="text-gray-300 hover:text-white" />,
      )
    : null,
  getItem(
    <Link to="/posts" className="select-none">
      {"Questions"}
    </Link>,
    "5",
    <MdQuestionAnswer className="text-gray-300 hover:text-white" />,
  ),
  getItem(
    <Link to="/feedbacks" className="select-none">
      {"Feedbacks"}
    </Link>,
    "7",
    <MdReviews className="text-gray-300 hover:text-white" />,
  ),
  user
    ? getItem(
        <Link to="/report/problem" className="select-none">
          {"Report a problem"}
        </Link>,
        "report",
        <MdReportProblem className="text-gray-300 hover:text-white" />,
      )
    : null,
];

export default items;
