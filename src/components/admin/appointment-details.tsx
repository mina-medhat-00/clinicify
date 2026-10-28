import { Empty } from "@/components/ui/display";
import dayjs from "dayjs";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import DatePicker, { type SelectedDay } from "@/components/doctor/date-picker";
import AppointmentCard from "@/components/schedule/appointment-card";
import CancelSlotPopUp from "@/components/schedule/cancel-slot-pop-up";
import { useCancelPrompt } from "@/hooks/use-cancel-prompt";
import { useSlotsContext } from "@/contexts/slots-context";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";
import cancelAppointment from "@/services/cancel-appointment";
import type { Id } from "@/types/user";

// One doctor's day of slots, inside the admin's doctor list.
export default function AppointmentDetails({ doctorId }: { doctorId: Id }) {
  const { timeZone, messageApi, socket } = useUtilsContext();
  const { fetchUserData } = useUserContext();
  const [selectedDate, setSelectedDate] = useState<SelectedDay>({
    count: 0,
    date: dayjs().format("YYYY-MM-DD"),
  });
  const { slotsData, isLoading, fetchSlotsData } = useSlotsContext();
  const cancel = useCancelPrompt();
  const day = selectedDate.date;
  useEffect(
    function () {
      socket.emit("join_doctor", doctorId);
    },
    [socket, doctorId],
  );
  useEffect(
    function () {
      function getSlots(data?: { date?: string }) {
        if (day === data?.date)
          void fetchSlotsData({ doctorId, date: day }, { silent: true });
      }
      socket.on("update_slots", getSlots);
      void fetchSlotsData({ doctorId, date: day });
      return function () {
        socket.off("update_slots", getSlots);
      };
    },
    [day, doctorId, fetchSlotsData, socket],
  );
  const slots = slotsData?.totalSlots ?? [];
  return (
    <>
      <DatePicker
        fromAppointment={true}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
      <div className="mt-2 max-h-52 overflow-auto p-1">
        <div className="flex gap-2 justify-evenly flex-wrap">
          <CancelSlotPopUp
            prompt={cancel.prompt}
            onClose={cancel.close}
            onConfirm={function (slot) {
              void cancelAppointment({
                date: day,
                slotTime: slot.slotTime,
                appointmentId: slot.appointmentId,
                doctorId,
                cancelFrom: "admin",
                socket,
                messageApi,
                fetchUserData,
              }).then(function (canceled) {
                if (!canceled) return;
                cancel.close();
                void fetchSlotsData({ date: day, doctorId });
              });
            }}
          />
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : !slots.length ? (
            <Empty
              className="flex flex-col"
              description={
                <span className="font-medium text-white bg-gray-400 p-1 rounded-md">
                  No Appointments Scheduled
                </span>
              }
            />
          ) : (
            slots.map(function (slot, i) {
              return (
                <div key={slot.appointmentId} className="grow">
                  <AppointmentCard
                    slot={slot}
                    order={i + 1}
                    timeZone={timeZone}
                    selectedDate={dayjs(day)}
                    socket={socket}
                    tAppointments={slots}
                    onCancel={cancel.open}
                    admin={true}
                    userid={doctorId}
                    fetchSlotsData={fetchSlotsData}
                    fetchUserData={fetchUserData}
                    messageApi={messageApi}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
