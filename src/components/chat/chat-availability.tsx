import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "@/components/ui/loader";
import { useAppointmentContext } from "@/contexts/appointment-context";
import { useChatContext } from "@/contexts/chat-context";
import type { Appointment } from "@/types/appointment";
import type { Id, UserType } from "@/types/user";

type Remaining =
  | { remainingTime: string; targetDate: Date; mode: "later" | "now" }
  | { remainingTime: null; targetDate: null; mode: null };

// The next appointment that isn't over yet (canceled ones don't count):
// "later" before it starts, "now" while it runs.
function nearestRemaining(
  appointments: Appointment[],
  timeZone: string,
  now: number,
): Remaining {
  const starts = appointments
    .filter(function ({ appointment_state }) {
      return appointment_state !== "canceled";
    })
    .map(function ({ schedule_date, slot_time, appointment_duration }) {
      return {
        start: new Date(`${schedule_date} ${slot_time} ${timeZone}`),
        duration: appointment_duration,
      };
    })
    .sort(function (a, b) {
      return a.start.getTime() - b.start.getTime();
    });
  for (const { start, duration } of starts) {
    if (now < start.getTime())
      return {
        remainingTime: start.toLocaleString(),
        targetDate: start,
        mode: "later",
      };
    if (now < start.getTime() + duration)
      return { remainingTime: "Right Now !!", targetDate: start, mode: "now" };
  }
  return { remainingTime: null, targetDate: null, mode: null };
}

export default function ChatAvailability({
  withUser,
  withUserType,
  timeZone,
  withNickName,
}: {
  withUser: Id;
  withUserType?: UserType;
  timeZone: string;
  withNickName?: string;
}) {
  const { appointmentData, isLoading, fetchAppointmentData } =
    useAppointmentContext();
  const { fetchChatData } = useChatContext();
  const [now] = useState(Date.now);
  const remaining = nearestRemaining(appointmentData ?? [], timeZone, now);
  useEffect(
    function () {
      void fetchAppointmentData({ doctorId: withUser });
    },
    [fetchAppointmentData, withUser],
  );
  // Reload the chat when the appointment starts, so the input opens.
  useEffect(
    function () {
      let timeId: ReturnType<typeof setTimeout> | undefined;
      if (remaining.mode === "later") {
        timeId = setTimeout(
          function () {
            void fetchChatData({ chat_to: withUser }, { silent: true });
          },
          remaining.targetDate.getTime() + 1000 - now,
        );
      } else if (remaining.mode === "now") {
        void fetchChatData({ chat_to: withUser }, { silent: true });
      }
      return function () {
        clearTimeout(timeId);
      };
    },
    [
      appointmentData,
      fetchChatData,
      remaining.mode,
      remaining.targetDate,
      timeZone,
      withUser,
      now,
    ],
  );
  return (
    <div className="bg-gray-600 px-1 rounded-tr-lg py-8 rounded-tl-lg font-medium text-white">
      {remaining.remainingTime ? (
        <div className="flex flex-wrap justify-evenly gap-1">
          <div className="text-lg text-gray-300 font-bold">
            Chatting with Your Doctor opens at
          </div>
          <span className="text-lg font-bold">{remaining.remainingTime}</span>
        </div>
      ) : isLoading ? (
        <Loader />
      ) : withUserType === "doctor" ? (
        <div className="flex flex-wrap px-1 justify-evenly gap-2 text-lg items-center">
          <div>There's no Appointments Booked yet</div>
          <Link
            to={`/profile/${String(withUser)}`}
            className="hover:bg-blue-500 bg-blue-400 p-4 text-center text-sm rounded-md text-white hover:text-gray-100"
          >
            Book Now
          </Link>
        </div>
      ) : (
        <div>Cannot Chat with {withNickName} right now</div>
      )}
    </div>
  );
}
