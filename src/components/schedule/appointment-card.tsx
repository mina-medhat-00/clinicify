import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  Loading3QuartersOutlined,
  VideoCameraFilled,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { BiMessageAltDetail } from "react-icons/bi";
import { FaClinicMedical } from "react-icons/fa";
import { HiStatusOnline } from "react-icons/hi";
import { MdAutoDelete, MdFreeCancellation } from "react-icons/md";
import { TbEditCircle } from "react-icons/tb";

const adjustTime = (date?: any, time?: any, timeZone?: any, ..._args: any[]) =>
  new Date(`${date} ${time} ${timeZone}`).toLocaleTimeString("en", {
    hour: "numeric",
    minute: "numeric",
  });
const getAppointmentVal = (
  appointment_state?: any,
  valDone?: any,
  valBooked?: any,
  valFree?: any,
  valRunning?: any,
  valDefault?: any,
) =>
  appointment_state == "done"
    ? valDone
    : appointment_state == "booked"
      ? valBooked
      : appointment_state == "free"
        ? valFree
        : appointment_state == "running"
          ? valRunning
          : valDefault;
const AppointmentCard = ({
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
}: any) => {
  const [showAction, setShowAction] = useState(false);
  const [showActionDelay, setShowActionDelay] = useState(false);
  useEffect(() => {
    const timeId = setTimeout(() => setShowActionDelay(showAction), 300);
    return () => clearTimeout(timeId);
  }, [showAction]);
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
      onMouseEnter={() => setShowAction(true)}
      onClick={() => setShowAction(true)}
      onMouseLeave={() => setShowAction(false)}
      onTouchMove={() => setShowAction(true)}
      onTouchCancel={() => setShowAction(false)}
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
                onClick={() => {
                  setIsEdit(order);
                  setHandleDrawer(true);
                }}
                className="flex cursor-pointer items-center bg-gray-700/60 hover:bg-gray-700/80 grow gap-1 justify-center"
              >
                <span className="text-white font-medium">Edit</span>
                <TbEditCircle className="flex items-center text-gray-100 text-2xl" />
              </div>
            )}

            {getAppointmentVal(
              appointmentState,
              null,
              <div
                onClick={() => {
                  setBookedAppointment({ slotTime, appointmentId });
                  setShowPop(() => ({
                    show: true,
                    data: { slotTime, appointmentId },
                  }));
                }}
                className="flex cursor-pointer items-center bg-red-700/60 hover:bg-red-700/80 grow gap-1 justify-center"
              >
                <span className="text-white font-medium">Cancel</span>
                <MdFreeCancellation className="flex items-center text-yellow-200 text-2xl" />
              </div>,
              <div
                onClick={() =>
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
                  )
                }
                className="flex cursor-pointer items-center bg-red-700/60 hover:bg-red-700/80 grow gap-1 justify-center"
              >
                <span className="text-white font-medium">Delete</span>
                <MdAutoDelete className="flex items-center text-yellow-200 text-2xl" />
              </div>,
            )}
          </div>
        )}
      <div className="flex flex-wrap justify-between gap-2">
        <div className={`flex gap-2 bg-gray-400/40 p-2 rounded-lg`}>
          {getAppointmentVal(
            appointmentState,
            <CheckCircleOutlined className="flex items-center text-yellow-200 text-2xl" />,
            <ClockCircleOutlined className="flex items-center text-yellow-200 text-2xl" />,
            <Loading3QuartersOutlined className="flex items-center text-yellow-200 text-2xl" />,
            <HiStatusOnline className="flex items-center text-yellow-200 text-2xl" />,
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
            <FaClinicMedical className="flex items-center text-gray-200 text-xl" />
          ) : appointmentType == "chat" ? (
            <BiMessageAltDetail className="flex items-center text-gray-200 text-xl" />
          ) : appointmentType == "videoChat" ? (
            <VideoCameraFilled className="flex items-center text-gray-200 text-xl" />
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
};

export default AppointmentCard;
