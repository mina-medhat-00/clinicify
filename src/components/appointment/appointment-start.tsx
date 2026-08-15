import { LoadingOutlined, VideoCameraFilled } from "@ant-design/icons";
import axios from "axios";
import { useState } from "react";
import { BsFillChatFill } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";
const APPLICATION_SERVER_URL = import.meta.env.PROD
  ? ""
  : `http://${window.location.hostname}:5000`;
const AppointmentStart = ({ appointmentDetails }: any) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<any>(null);
  const { messageApi } = useUtilsContext();
  const { fetchUserData } = useUserContext();
  const createSession = async () => {
    setIsLoading(true);
    await axios
      .post(
        `${APPLICATION_SERVER_URL}/join/meeting`,
        { data: { appointment_id: appointmentDetails?.appointment_id } },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${new Cookies().get("accessToken")}`,
          },
        },
      )
      .then((res?: any, ..._args: any[]) => {
        navigate(
          `/join/meeting/${res.data}?appointment_id=${appointmentDetails?.appointment_id}`,
        );
        setIsLoading(false);
      })
      .catch((err?: any, ..._args: any[]) => {
        setIsLoading(false);
        if (err?.response?.status == 400) {
          messageApi.open({
            key: 1,
            type: "warning",
            content: "there's something missing, try to re-login",
            duration: 3,
          });
          return;
        } else if (err?.response?.status == 401) {
          messageApi.open({
            key: 1,
            type: "error",
            content: "cannot start that appointment right now!!",
            duration: 3,
          });
          fetchUserData(true, new Cookies().get("accessToken"));
          return;
        }
        messageApi.open({
          key: 1,
          type: "error",
          content: "there's something wrong",
          duration: 3,
        });
      });
  };
  return (appointmentDetails?.appointment_state == "running" &&
    appointmentDetails?.appointment_type == "chat") ||
    appointmentDetails?.appointment_type == "videoCall" ? (
    <div className="text-white grow">
      {appointmentDetails?.appointment_type == "chat" ? (
        <div className="chat--details h-full">
          <Link
            to="/chat"
            onClick={() =>
              window?.localStorage.setItem("chatTo", appointmentDetails?.withId)
            }
            className="font-medium h-full hover:text-gray-200 text-xl flex justify-center items-center gap-2 hover:bg-blue-700 block text-white bg-blue-700/90 p-2 rounded-md"
          >
            Chat with {appointmentDetails?.withNickName}
            <BsFillChatFill className="text-white text-xl" />
          </Link>
        </div>
      ) : (
        <div
          onClick={() => createSession()}
          className={`video--details p-2 bg-blue-600/80 hover:bg-blue-600 cursor-pointer
           rounded shadow-md h-full ${isLoading ? "cursor-not-allowed" : ""}`}
        >
          <div className="font-medium h-full flex items-center gap-2 flex-wrap hover:text-gray-200 text-xl flex justify-center items-center gap-2 hover:bg-blue-700 block text-white bg-blue-700/90 p-2 rounded-md">
            Video Call with {appointmentDetails?.withNickName}
            {!isLoading ? (
              <VideoCameraFilled className="flex items-center text-white text-3xl" />
            ) : (
              <LoadingOutlined className="flex items-center text-white text-3xl" />
            )}
          </div>
        </div>
      )}
    </div>
  ) : null;
};

export default AppointmentStart;
