import { Hospital, Loader2, MessageSquareText, Video } from "lucide-react";
import type { AppointmentKind, AppointmentState } from "@/types/appointment";
import { slotClock } from "@/utils/time";

export default function BookButton({
  appointmentType,
  appointmentFees,
  appointmentState,
  slotTime,
  schedule_date,
  timeZone,
}: {
  appointmentType: AppointmentKind;
  appointmentFees: number;
  appointmentState: AppointmentState;
  slotTime: string;
  schedule_date: string;
  timeZone: string;
}) {
  return (
    <div>
      <div className="flex flex-wrap justify-between gap-2">
        <div className="flex gap-2 bg-gray-400/40 p-2 rounded-lg">
          <Loader2 className="flex items-center text-yellow-200 text-2xl animate-spin" />
          <span className="text-white font-medium">
            {appointmentState.toUpperCase()}
          </span>
        </div>
        <div className="flex gap-2 bg-gray-600/40 p-2 rounded-lg">
          {appointmentType === "inClinic" ? (
            <Hospital className="flex items-center text-gray-200 text-xl" />
          ) : appointmentType === "chat" ? (
            <MessageSquareText className="flex items-center text-gray-200 text-xl" />
          ) : (
            <Video className="flex items-center text-gray-200 text-xl" />
          )}
          <span className="text-white font-medium">
            {appointmentType.toUpperCase()}
          </span>
        </div>
        <div className="flex gap-2 bg-gray-400/40 p-2 rounded-lg">
          <span className="text-white font-medium">{appointmentFees} L.E</span>
        </div>
      </div>
      <hr className="w-full my-2" />
      <div className="w-full text-center">
        <span className="text-white font-medium">
          {slotClock(schedule_date, slotTime, timeZone)}
        </span>
      </div>
    </div>
  );
}
