import { Button, Empty, Popover } from "@/components/ui";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BookButton from "@/components/booking/book-button";
import DatePicker from "@/components/doctor/date-picker";
import Loader from "@/components/ui/loader";
import { useSlotsContext } from "@/contexts/slots-context";
import { useUserContext } from "@/contexts/user-context";

export default function BookCard({ doctorId, socket, timeZone }: any) {
  const { slotsData, isLoading, fetchSlotsData } = useSlotsContext();
  const { userData } = useUserContext();
  const [selectedDate, setSelectedDate] = useState(function () {
    return {
      count: 0,
      date: dayjs().format("YYYY-MM-DD"),
    };
  });
  const [bookedAppointment, setBookedAppointment] = useState<any>(null);
  const navigate = useNavigate();
  useEffect(function () {
    socket?.emit("join_doctor", doctorId);
  }, []);
  useEffect(
    function () {
      function fetchSlots(data?: any, ..._args: any[]) {
        if (selectedDate.date == data?.date)
          fetchSlotsData(
            {
              date: selectedDate.date,
              doctorId,
            },
            true,
          );
      }
      if (doctorId && selectedDate.date) {
        fetchSlotsData({
          date: selectedDate.date,
          doctorId,
        });
        socket?.on("update_slots", fetchSlots);
      }
      return function () {
        socket?.off("update_slots", fetchSlots);
      };
    },
    [selectedDate.date],
  );
  function isToday(val?: any, ..._args: any[]) {
    return (
      new Date(selectedDate.date + " " + val).getTime() > Date.now() + 1000 * 60
    );
  }
  return (
    <>
      <div
        onClick={function (e?: any, ..._args: any[]) {
          e.stopPropagation();
          e.preventDefault();
        }}
        className={`doctor--slots flex flex-col shadow-lg rounded bg-gray-200`}
      >
        <DatePicker
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
        <div className="flex flex-col py-2 grow justify-center items-center">
          {slotsData?.freeSlots?.some(function ({ slotTime: value }: any) {
            return isToday(value);
          }) ? (
            <>
              <div className="flex items-center justify-center flex-wrap rounded-md shadow-2xl p-2 grow gap-2 scroll--h scroll--v scroll--v--chat w-3/4 h-48 overflow-auto">
                {slotsData?.freeSlots?.map(function (
                  {
                    slotTime: value,
                    appointmentType,
                    appointmentFees,
                    appointmentState,
                    schedule_date,
                  }: any,
                  i?: any,
                ) {
                  return (
                    isToday(value) && (
                      <div
                        className={`flex cursor-pointer flex-col relative rounded-lg 
    ${
      bookedAppointment?.slotTime == value ? "bg-gray-700" : "bg-blue-800/80"
    } p-2`}
                        onClick={function () {
                          setBookedAppointment(function (
                            val?: any,
                            ..._args: any[]
                          ) {
                            return val?.slotTime == value
                              ? null
                              : slotsData?.freeSlots?.[i];
                          });
                        }}
                        key={value}
                      >
                        <BookButton
                          slotTime={value}
                          timeZone={timeZone || ""}
                          schedule_date={schedule_date}
                          appointmentState={appointmentState}
                          appointmentType={appointmentType}
                          appointmentFees={appointmentFees}
                        />
                      </div>
                    )
                  );
                })}
              </div>
              <Popover
                trigger={"click"}
                arrow={false}
                open={
                  bookedAppointment && userData && userData?.user_id != doctorId
                    ? false
                    : null
                }
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
                    if (
                      bookedAppointment &&
                      userData &&
                      userData?.user_id != doctorId
                    )
                      navigate(`/profile/${doctorId}`);
                    window?.localStorage?.setItem(
                      "book_appointment",
                      bookedAppointment?.appointmentId,
                    );
                  }}
                  type="primary"
                  className={`my-4 m-auto sm:font-medium h-12 w-2/3 block ${
                    !bookedAppointment ||
                    !(userData && userData?.user_id != doctorId)
                      ? "bg-gray-100 text-gray-400 border-gray-400"
                      : "hover:bg-gray-800 bg-gray-700"
                  }  rounded-lg`}
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
    </>
  );
}
