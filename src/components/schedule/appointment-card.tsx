import { useEffect, useState } from "react";
import type { Dayjs } from "dayjs";
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
import type { ReactNode } from "react";
import type { Socket } from "socket.io-client";
import type { SlotsQuery } from "@/contexts/slots-context";
import type { LoadOptions, ServiceContext } from "@/services/client";
import scheduleAppointments from "@/services/schedule-appointments";
import type { AppointmentState, Slot } from "@/types/appointment";
import type { Id } from "@/types/user";
import { slotClock } from "@/utils/time";

// The slot a cancel button refers to.
export type SlotRef = Pick<Slot, "slotTime" | "appointmentId">;

const stateColors: Partial<Record<AppointmentState, string>> = {
  done: "bg-gray-800/80",
  booked: "bg-yellow-800/80",
  free: "bg-blue-800/80",
  running: "bg-blue-900/80",
};

const stateIcons: Partial<Record<AppointmentState, ReactNode>> = {
  done: <CheckCircle className="flex items-center text-yellow-200 text-2xl" />,
  booked: <Clock className="flex items-center text-yellow-200 text-2xl" />,
  free: (
    <Loader2 className="flex items-center text-yellow-200 text-2xl animate-spin" />
  ),
  running: <Radio className="flex items-center text-yellow-200 text-2xl" />,
};

const typeIcons = {
  inClinic: <Hospital className="flex items-center text-gray-200 text-xl" />,
  chat: (
    <MessageSquareText className="flex items-center text-gray-200 text-xl" />
  ),
  videoCall: <Video className="flex items-center text-gray-200 text-xl" />,
};

export default function AppointmentCard({
  slot,
  order,
  onEdit,
  onCancel,
  tAppointments,
  selectedDate,
  messageApi,
  userid,
  fetchSlotsData,
  fetchUserData,
  socket,
  admin,
  timeZone,
}: ServiceContext & {
  slot: Slot;
  // Position in the day's list, starting at 1.
  order: number;
  onEdit?: (order: number) => void;
  // Asks before canceling a booked slot.
  onCancel: (slot: SlotRef) => void;
  tAppointments: Slot[];
  selectedDate: Dayjs;
  userid: Id;
  fetchSlotsData: (
    query: SlotsQuery,
    options?: LoadOptions,
  ) => Promise<unknown>;
  socket: Socket;
  // Shown inside the admin's doctor list (no editing).
  admin?: boolean;
  timeZone: string;
}) {
  const {
    appointmentState,
    appointmentType,
    appointmentFees,
    appointmentId,
    slotTime,
  } = slot;
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
  const date = selectedDate.format("YYYY-MM-DD");
  return (
    <div
      className={`${
        !admin
          ? "flex flex-col m:w-1/3 lg:w-1/4 2xl:w-1/5 grow justify-between"
          : ""
      } relative rounded-lg ${stateColors[appointmentState] ?? ""} p-2`}
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
      {(showAction || showActionDelay) && appointmentState !== "running" && (
        <div
          className={`absolute duration-300 flex justify-between ${
            showAction && showActionDelay ? "h-full" : "h-0"
          } w-full overflow-hidden transition-all bg-green-400/50 left-0 top-0 rounded-lg`}
        >
          {appointmentState === "free" && !admin && onEdit && (
            <div
              onClick={function () {
                onEdit(order);
              }}
              className="flex cursor-pointer items-center bg-gray-700/60 hover:bg-gray-700/80 grow gap-1 justify-center"
            >
              <span className="text-white font-medium">Edit</span>
              <Pencil className="flex items-center text-gray-100 text-2xl" />
            </div>
          )}
          {appointmentState === "booked" ? (
            <div
              onClick={function () {
                onCancel({ slotTime, appointmentId });
              }}
              className="flex cursor-pointer items-center bg-red-700/60 hover:bg-red-700/80 grow gap-1 justify-center"
            >
              <span className="text-white font-medium">Cancel</span>
              <CalendarX className="flex items-center text-yellow-200 text-2xl" />
            </div>
          ) : appointmentState === "free" ? (
            <div
              onClick={function () {
                void scheduleAppointments({
                  date,
                  doctorId: userid,
                  totalSlots: tAppointments,
                  deletedAppointments: [appointmentId],
                  socket,
                  messageApi,
                  fetchUserData,
                }).then(function () {
                  void fetchSlotsData(
                    { date, doctorId: userid },
                    { silent: true },
                  );
                });
              }}
              className="flex cursor-pointer items-center bg-red-700/60 hover:bg-red-700/80 grow gap-1 justify-center"
            >
              <span className="text-white font-medium">Delete</span>
              <Trash2 className="flex items-center text-yellow-200 text-2xl" />
            </div>
          ) : null}
        </div>
      )}
      <div className="flex flex-wrap justify-between gap-2">
        <div className="flex gap-2 bg-gray-400/40 p-2 rounded-lg">
          {stateIcons[appointmentState]}
          <span className="text-white font-medium">
            {appointmentState.toUpperCase()}
          </span>
        </div>
        <div className="flex gap-2 bg-gray-400/40 p-2 rounded-lg">
          <span className="text-white font-medium">{appointmentFees} L.E</span>
        </div>
        <div className="flex gap-2 bg-gray-600/40 p-2 rounded-lg">
          {typeIcons[appointmentType]}
          <span className="text-white font-medium">
            {appointmentType.toUpperCase()}
          </span>
        </div>
      </div>
      <hr className="w-full my-2" />
      <div className="w-full text-center">
        <span className="text-white font-medium">
          {slotClock(date, slotTime, timeZone)}
        </span>
      </div>
    </div>
  );
}
