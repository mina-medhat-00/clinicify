import { useEffect, useState } from "react";
import {
  CalendarX,
  CheckCircle,
  Clock,
  Hospital,
  Loader2,
  MessageSquareText,
  Pencil,
  Radio,
  Trash2,
  Video,
} from "lucide-react";

function adjustTime(date?: any, time?: any, timeZone?: any, ..._args: any[]) {
  return new Date(`${date} ${time} ${timeZone}`).toLocaleTimeString("en", {
    hour: "numeric",
    minute: "numeric",
  });
}
function getAppointmentVal(
  appointment_state?: any,
  valDone?: any,
  valBooked?: any,
  valFree?: any,
  valRunning?: any,
  valDefault?: any,
) {
  return appointment_state == "done"
    ? valDone
    : appointment_state == "booked"
      ? valBooked
      : appointment_state == "free"
        ? valFree
        : appointment_state == "running"
          ? valRunning
          : valDefault;
}
function AppointmentCard({
  setShowPop,
  appointmentState,
  appointmentType,
  appointmentFees,
  appointmentId,
  order,
  slotTime,
  setIsEdit,
  setHandleDrawer,
  setBookedAppointment,
  scheduleAppointments,
  tAppointments,
  selectedDate,
  messageApi,
  userid,
  fetchSlotsData,
  fetchUserData,
  socket,
  admin,
  timeZone,
}: any) {
  const [showAction, setShowAction] = useState(false);
  const [showActionDelay, setShowActionDelay] = useState(false);
  useEffect(
    function () {
      const timeId = setTimeout(function () {
        setShowActionDelay(showAction);
      }, 300);
      return function () {
        clearTimeout(timeId);
      };
    },
    [showAction],
  );
  return (
    <div
      className={`${
        !admin
          ? "flex flex-col m:w-1/3 lg:w-1/4 2xl:w-1/5 grow justify-between"
          : ""
      } relative rounded-lg ${getAppointmentVal(
        appointmentState,
        "bg-gray-800/80",
        "bg-yellow-800/80",
        "bg-blue-800/80",
        "bg-blue-900/80",
      )} p-2`}
      onMouseEnter={function () {
        setShowAction(true);
      }}
      onClick={function () {
        setShowAction(true);
      }}
      onMouseLeave={function () {
        setShowAction(false);
      }}
      onTouchMove={function () {
        setShowAction(true);
      }}
      onTouchCancel={function () {
        setShowAction(false);
      }}
    >
      {(showAction ? showAction : showActionDelay) &&
        appointmentState != "running" && (
          <div
            className={`absolute duration-300 flex justify-between ${
              !showAction ? "h-0" : showActionDelay ? "h-full" : "h-0"
            } w-full overflow-hidden transition-all bg-green-400/50 left-0 top-0 rounded-lg`}
          >
            {appointmentState == "free" && !admin && (
              <div
                onClick={function () {
                  setIsEdit(order);
                  setHandleDrawer(true);
                }}
                className="flex cursor-pointer items-center bg-gray-700/60 hover:bg-gray-700/80 grow gap-1 justify-center"
              >
                <span className="text-white font-medium">Edit</span>
                <Pencil className="flex items-center text-gray-100 text-2xl" />
              </div>
            )}

            {getAppointmentVal(
              appointmentState,
              null,
              <div
                onClick={function () {
                  setBookedAppointment({ slotTime, appointmentId });
                  setShowPop(function () {
                    return {
                      show: true,
                      data: { slotTime, appointmentId },
                    };
                  });
                }}
                className="flex cursor-pointer items-center bg-red-700/60 hover:bg-red-700/80 grow gap-1 justify-center"
              >
                <span className="text-white font-medium">Cancel</span>
                <CalendarX className="flex items-center text-yellow-200 text-2xl" />
              </div>,
              <div
                onClick={function () {
                  scheduleAppointments(
                    selectedDate,
                    null,
                    tAppointments,
                    messageApi,
                    fetchSlotsData,
                    userid,
                    fetchUserData,
                    null,
                    [appointmentId],
                    null,
                    null,
                    socket,
                    userid,
                  );
                }}
                className="flex cursor-pointer items-center bg-red-700/60 hover:bg-red-700/80 grow gap-1 justify-center"
              >
                <span className="text-white font-medium">Delete</span>
                <Trash2 className="flex items-center text-yellow-200 text-2xl" />
              </div>,
            )}
          </div>
        )}
      <div className="flex flex-wrap justify-between gap-2">
        <div className={`flex gap-2 bg-gray-400/40 p-2 rounded-lg`}>
          {getAppointmentVal(
            appointmentState,
            <CheckCircle className="flex items-center text-yellow-200 text-2xl" />,
            <Clock className="flex items-center text-yellow-200 text-2xl" />,
            <Loader2 className="flex items-center text-yellow-200 text-2xl animate-spin" />,
            <Radio className="flex items-center text-yellow-200 text-2xl" />,
          )}
          <span className="text-white font-medium">
            {appointmentState?.toUpperCase()}
          </span>
        </div>
        <div className={`flex gap-2 bg-gray-400/40 p-2 rounded-lg`}>
          <span className="text-white font-medium">{appointmentFees} L.E</span>
        </div>
        <div className={`flex gap-2 bg-gray-600/40 p-2 rounded-lg`}>
          {appointmentType == "inClinic" ? (
            <Hospital className="flex items-center text-gray-200 text-xl" />
          ) : appointmentType == "chat" ? (
            <MessageSquareText className="flex items-center text-gray-200 text-xl" />
          ) : appointmentType == "videoChat" ? (
            <Video className="flex items-center text-gray-200 text-xl" />
          ) : null}
          <span className="text-white font-medium">
            {appointmentType?.toUpperCase()}
          </span>
        </div>
      </div>
      <hr className="w-full my-2" />
      <div className="w-full text-center">
        <span className="text-white font-medium">
          {adjustTime(
            selectedDate?.format("YYYY-MM-DD"),
            slotTime,
            timeZone || "",
          )}
        </span>
      </div>
    </div>
  );
}

export default AppointmentCard;
