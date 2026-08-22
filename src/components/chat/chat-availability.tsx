import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Cookies from "universal-cookie";
import Loader from "@/components/ui/loader";
import { useAppointmentContext } from "@/contexts/appointment-context";
import { useChatContext } from "@/contexts/chat-context";

function nearestRemaining(appointmentData?: any, timeZone?: any, now?: any) {
  let temp_app = new Array(...(appointmentData ? appointmentData : []));
  while (temp_app?.length) {
    const nearestTime = temp_app?.reduce(function (pre?: any, curr?: any) {
      return new Date(`${pre?.schedule_date} ${pre?.slot_time}`) <
        new Date(`${curr?.schedule_date} ${curr?.slot_time}`)
        ? pre
        : curr;
    }, null);
    if (nearestTime) {
      const targetDate = new Date(
        `${nearestTime?.schedule_date} ${nearestTime?.slot_time} ${timeZone}`,
      );
      if (now < targetDate.getTime()) {
        return {
          remainingTime: targetDate.toLocaleString(),
          targetDate,
          mode: "later",
        };
      }
      if (now < targetDate.getTime() + nearestTime?.appointment_duration) {
        return {
          remainingTime: "Right Now !!",
          targetDate,
          mode: "now",
        };
      }
      temp_app = temp_app?.filter(function ({ appointment_id }: any) {
        return appointment_id != nearestTime?.appointment_id;
      });
    } else break;
  }
  return { remainingTime: null, targetDate: null, mode: null };
}

export default function ChatAvailability({
  withUser,
  withUserType,
  timeZone,
  withNickName,
}: any) {
  const { appointmentData, isLoading, fetchAppointmentData } =
    useAppointmentContext();
  const { fetchChatData } = useChatContext();
  const [now] = useState(Date.now);
  const remaining = nearestRemaining(appointmentData, timeZone, now);
  useEffect(
    function () {
      fetchAppointmentData(true, new Cookies().get("accessToken"), null, null, {
        doctorId: withUser,
      });
    },
    [fetchAppointmentData, withUser],
  );
  useEffect(
    function () {
      let timeId;
      if (remaining.mode === "later" && remaining.targetDate) {
        timeId = setTimeout(
          function () {
            fetchChatData(
              true,
              new Cookies().get("accessToken"),
              {
                chat_to: withUser,
              },
              true,
            );
          },
          remaining.targetDate.getTime() + 1000 - now,
        );
      } else if (remaining.mode === "now") {
        fetchChatData(
          true,
          new Cookies().get("accessToken"),
          {
            chat_to: withUser,
          },
          true,
        );
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
      {appointmentData?.length && remaining.remainingTime ? (
        <div className="flex flex-wrap justify-evenly gap-1">
          <div className="text-lg text-gray-300  font-bold">
            Chatting with Your Doctor opens at
          </div>
          <span className="text-lg font-bold">{remaining.remainingTime}</span>
        </div>
      ) : isLoading ? (
        <Loader />
      ) : withUserType == "doctor" ? (
        <div className="flex flex-wrap px-1 justify-evenly gap-2 text-lg items-center">
          <div>There's no Appointments Booked yet</div>
          <Link
            to={`/profile/${withUser}`}
            className="hover:bg-blue-500 bg-blue-400 p-4 text-center text-sm 
          rounded-md text-white hover:text-gray-100"
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
