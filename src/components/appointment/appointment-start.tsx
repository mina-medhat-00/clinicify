import { Loader2, MessageSquare, Video } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";
import { api } from "@/services/client";

export default function AppointmentStart({ appointmentDetails }: any) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<any>(null);
  const { messageApi } = useUtilsContext();
  const { fetchUserData } = useUserContext();
  async function createSession() {
    setIsLoading(true);
    await api
      .post("/join/meeting", {
        data: { appointment_id: appointmentDetails?.appointment_id },
      })
      .then(function (res?: any) {
        navigate(
          `/join/meeting/${res.data}?appointment_id=${appointmentDetails?.appointment_id}`,
        );
        setIsLoading(false);
      })
      .catch(function (err?: any) {
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
          fetchUserData({ silent: true });
          return;
        }
        messageApi.open({
          key: 1,
          type: "error",
          content: "there's something wrong",
          duration: 3,
        });
      });
  }
  return (appointmentDetails?.appointment_state == "running" &&
    appointmentDetails?.appointment_type == "chat") ||
    appointmentDetails?.appointment_type == "videoCall" ? (
    <div className="text-white grow">
      {appointmentDetails?.appointment_type == "chat" ? (
        <div className="chat--details h-full">
          <Link
            to="/chat"
            onClick={function () {
              window?.localStorage.setItem(
                "chatTo",
                appointmentDetails?.withId,
              );
            }}
            className="font-medium h-full hover:text-gray-200 text-xl justify-center items-center gap-2 hover:bg-blue-700 block text-white bg-blue-700/90 p-2 rounded-md"
          >
            Chat with {appointmentDetails?.withNickName}
            <MessageSquare className="text-white text-xl" />
          </Link>
        </div>
      ) : (
        <div
          onClick={function () {
            createSession();
          }}
          className={`video--details p-2 bg-blue-600/80 hover:bg-blue-600 cursor-pointer
           rounded shadow-md h-full ${isLoading ? "cursor-not-allowed" : ""}`}
        >
          <div className="font-medium h-full flex items-center gap-2 flex-wrap hover:text-gray-200 text-xl justify-center hover:bg-blue-700 text-white bg-blue-700/90 p-2 rounded-md">
            Video Call with {appointmentDetails?.withNickName}
            {!isLoading ? (
              <Video className="flex items-center text-white text-3xl" />
            ) : (
              <Loader2 className="flex items-center text-white text-3xl animate-spin" />
            )}
          </div>
        </div>
      )}
    </div>
  ) : null;
}
