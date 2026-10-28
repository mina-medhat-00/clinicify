import { useEffect } from "react";
import type { Socket } from "socket.io-client";
import CountdownTimer from "@/components/appointment/appointment-countdown-timer";
import type { useAppointmentContext } from "@/contexts/appointment-context";
import type { AppointmentState } from "@/types/appointment";
import type { Id } from "@/types/user";
import { slotClock } from "@/utils/time";

export default function AppointmentTime({
  appointmentId,
  appointment_state,
  schedule_date,
  slot_time,
  doctorId,
  patientId,
  updateAppointment,
  date,
  appointment_duration,
  timeZone,
  socket,
}: {
  appointmentId: Id;
  appointment_state: AppointmentState;
  schedule_date: string;
  slot_time: string;
  doctorId: Id;
  patientId: Id;
  updateAppointment: ReturnType<
    typeof useAppointmentContext
  >["updateAppointment"];
  // The day the list shows (the API returns that day's list).
  date: string;
  appointment_duration: number;
  timeZone: string;
  socket: Socket;
}) {
  // When a booked appointment starts, or a running one ends, ask the API to
  // move it to its next state.
  useEffect(
    function () {
      const startsAt = new Date(
        schedule_date + " " + slot_time + timeZone,
      ).getTime();
      if (isNaN(startsAt)) return;
      function advance() {
        void updateAppointment(
          { doctorId, patientId, appointmentId },
          { date },
        );
      }
      let at: number;
      if (appointment_state === "booked") at = startsAt;
      else if (appointment_state === "running") {
        socket.emit("update_appointments", {
          date: schedule_date,
          doctorId,
          appointmentId,
        });
        at = startsAt + appointment_duration;
      } else return;
      const timeId = setTimeout(advance, Math.max(at - Date.now(), 0));
      return function () {
        clearTimeout(timeId);
      };
    },
    [
      schedule_date,
      slot_time,
      appointment_state,
      appointmentId,
      appointment_duration,
      date,
      doctorId,
      updateAppointment,
      patientId,
      socket,
      timeZone,
    ],
  );
  return (
    <div className="flex gap-4 items-center">
      <div className="flex flex-wrap grow gap-2 justify-center items-center">
        <div className="text-white grow bg-gray-300/50 rounded-lg p-1 font-medium text-center">
          <div className="text-white flex justify-center">
            <table className="grow">
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="border-r border-gray-300 p-1 bg-gray-500">
                    Day
                  </td>
                  <td className="border-r border-gray-300 p-1 bg-gray-500">
                    Date
                  </td>
                  <td className="p-1 bg-gray-500">
                    Appointment
                    <br /> Time
                  </td>
                </tr>
                <tr className="">
                  <td className="border-r border-gray-300 p-1">
                    {new Date(schedule_date).toLocaleString("en-us", {
                      weekday: "long",
                    })}
                  </td>
                  <td className="border-r border-gray-300 p-1">
                    {schedule_date}
                  </td>
                  <td>{slotClock(schedule_date, slot_time, timeZone)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {(appointment_state === "booked" ||
          appointment_state === "running") && (
          <div className="text-white bg-gray-300/50 rounded-lg p-1 font-medium text-center">
            <span className="text-gray-700 font-medium text-base lg:text-lg 2xl:text-xl">
              Remaining Time
            </span>
            <hr className="border-gray-700" />
            <CountdownTimer
              targetDate={
                appointment_state === "booked"
                  ? new Date(schedule_date + " " + slot_time + timeZone)
                  : new Date(
                      new Date(
                        schedule_date + " " + slot_time + timeZone,
                      ).getTime() + appointment_duration,
                    )
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
