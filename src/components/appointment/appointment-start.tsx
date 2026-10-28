import { Loader2, MessageSquare, Video } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";
import { api, errorStatus } from "@/services/client";
import type { AppointmentKind, AppointmentState } from "@/types/appointment";
import type { Id } from "@/types/user";
import { toQuery } from "@/utils/query";

export interface AppointmentDetails {
  // The other person in the appointment.
  withNickName: string;
  withId: Id;
  appointmentId: Id;
  appointment_state: AppointmentState;
  appointment_type: AppointmentKind;
}

export default function AppointmentStart({
  appointmentDetails,
}: {
  appointmentDetails: AppointmentDetails;
}) {
  const { appointmentId, appointment_state, appointment_type, withId } =
    appointmentDetails;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { messageApi } = useUtilsContext();
  const { fetchUserData } = useUserContext();
  function createSession() {
    setIsLoading(true);
    // The reply is the meeting's session id as plain text.
    api
      .post<string>("/join/meeting", {
        data: { appointment_id: appointmentId },
      })
      .then(function ({ data: session }) {
        setIsLoading(false);
        void navigate(
          `/join/meeting/${session}${toQuery({ appointment_id: appointmentId })}`,
        );
      })
      .catch(function (err: unknown) {
        setIsLoading(false);
        if (errorStatus(err) === 400) {
          messageApi.open({
            key: 1,
            type: "warning",
            content: "there's something missing, try to re-login",
            duration: 3,
          });
          return;
        } else if (errorStatus(err) === 401) {
          messageApi.open({
            key: 1,
            type: "error",
            content: "cannot start that appointment right now!!",
            duration: 3,
          });
          void fetchUserData({ silent: true });
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
  return (appointment_state === "running" && appointment_type === "chat") ||
    appointment_type === "videoCall" ? (
    <div className="text-white grow">
      {appointment_type === "chat" ? (
        <div className="chat--details h-full">
          <Link
            to="/chat"
            onClick={function () {
              window.localStorage.setItem("chatTo", String(withId));
            }}
            className="font-medium h-full hover:text-gray-200 text-xl justify-center items-center gap-2 hover:bg-blue-700 block text-white bg-blue-700/90 p-2 rounded-md"
          >
            Chat with {appointmentDetails.withNickName}
            <MessageSquare className="text-white text-xl" />
          </Link>
        </div>
      ) : (
        <div
          onClick={function () {
            if (!isLoading) createSession();
          }}
          className={`video--details p-2 bg-blue-600/80 hover:bg-blue-600 cursor-pointer rounded shadow-md h-full ${
            isLoading ? "cursor-not-allowed" : ""
          }`}
        >
          <div className="font-medium h-full flex items-center gap-2 flex-wrap hover:text-gray-200 text-xl justify-center hover:bg-blue-700 text-white bg-blue-700/90 p-2 rounded-md">
            Video Call with {appointmentDetails.withNickName}
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
