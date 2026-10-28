import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Socket } from "socket.io-client";
import BookButton from "@/components/booking/book-button";
import DatePicker from "@/components/doctor/date-picker";
import Loader from "@/components/ui/loader";
import { Button } from "@/components/ui/controls";
import { Empty } from "@/components/ui/display";
import { Popover } from "@/components/ui/overlay";
import { useSlotsContext } from "@/contexts/slots-context";
import { useUserContext } from "@/contexts/user-context";
import type { Id } from "@/types/user";
import type { Slot } from "@/types/appointment";

export default function BookCard({
  doctorId,
  socket,
  timeZone,
}: {
  doctorId: Id;
  socket: Socket;
  timeZone: string;
}) {
  const [now] = useState(Date.now);
  const { slotsData, isLoading, fetchSlotsData } = useSlotsContext();
  const { userData } = useUserContext();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(function () {
    return {
      count: 0,
      date: dayjs().format("YYYY-MM-DD"),
    };
  });
  const [bookedAppointment, setBookedAppointment] = useState<Slot | null>(null);
  const canBook = Boolean(
    bookedAppointment && userData && userData.user_id !== doctorId,
  );

  useEffect(
    function () {
      socket.emit("join_doctor", doctorId);
    },
    [doctorId, socket],
  );

  useEffect(
    function () {
      function fetchSlots(data?: { date?: string }) {
        if (selectedDate.date === data?.date)
          void fetchSlotsData(
            {
              date: selectedDate.date,
              doctorId,
            },
            { silent: true },
          );
      }

      void fetchSlotsData({
        date: selectedDate.date,
        doctorId,
      });
      socket.on("update_slots", fetchSlots);

      return function () {
        socket.off("update_slots", fetchSlots);
      };
    },
    [selectedDate.date, doctorId, fetchSlotsData, socket],
  );

  // Only slots starting more than a minute from now can be booked.
  function isUpcoming(time: string) {
    return new Date(`${selectedDate.date} ${time}`).getTime() > now + 1000 * 60;
  }
  const upcoming =
    slotsData?.freeSlots?.filter(function ({ slotTime }) {
      return isUpcoming(slotTime);
    }) ?? [];

  return (
    <div
      onClick={function (event) {
        event.stopPropagation();
        event.preventDefault();
      }}
      className="doctor--slots flex flex-col shadow-lg rounded bg-gray-200"
    >
      <DatePicker
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
      <div className="flex flex-col py-2 grow justify-center items-center">
        {upcoming.length ? (
          <>
            <div className="flex items-center justify-center flex-wrap rounded-md shadow-2xl p-2 grow gap-2 scroll--h scroll--v scroll--v--chat w-3/4 h-48 overflow-auto">
              {upcoming.map(function (slot) {
                const value = slot.slotTime;
                return (
                  <div
                    className={`flex cursor-pointer flex-col relative rounded-lg ${
                      bookedAppointment?.slotTime === value
                        ? "bg-gray-700"
                        : "bg-blue-800/80"
                    } p-2`}
                    onClick={function () {
                      setBookedAppointment(function (current) {
                        return current?.slotTime === value ? null : slot;
                      });
                    }}
                    key={value}
                  >
                    <BookButton
                      slotTime={value}
                      timeZone={timeZone}
                      schedule_date={slot.schedule_date}
                      appointmentState={slot.appointmentState}
                      appointmentType={slot.appointmentType}
                      appointmentFees={slot.appointmentFees}
                    />
                  </div>
                );
              })}
            </div>
            <Popover
              trigger="click"
              open={canBook ? false : null}
              content={
                <span className="font-medium">
                  {!bookedAppointment
                    ? "select your Appointment first"
                    : !userData
                      ? "signup/login first to book your appointment"
                      : "it's your profile"}
                </span>
              }
            >
              <Button
                onClick={function () {
                  if (!canBook || !bookedAppointment) return;
                  // The profile page opens the booking for this slot.
                  window.localStorage.setItem(
                    "book_appointment",
                    String(bookedAppointment.appointmentId),
                  );
                  void navigate(`/profile/${String(doctorId)}`);
                }}
                type="primary"
                className={`my-4 m-auto sm:font-medium h-12 w-2/3 block ${
                  canBook
                    ? "hover:bg-gray-800 bg-gray-700"
                    : "bg-gray-100 text-gray-400 border-gray-400"
                } rounded-lg`}
              >
                Book Now
              </Button>
            </Popover>
          </>
        ) : isLoading ? (
          <Loader />
        ) : slotsData?.freeSlots ? (
          <Empty
            description={
              <span className="font-medium text-gray-700">
                all slots booked
              </span>
            }
          />
        ) : (
          <Empty
            className="w-full flex flex-col items-center"
            description={
              <div className="font-medium text-gray-700">
                there's no slots available
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}
