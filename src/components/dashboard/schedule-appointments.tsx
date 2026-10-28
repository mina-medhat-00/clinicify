import { Drawer } from "@/components/ui/overlay";
import { Empty } from "@/components/ui/display";
import { message } from "@/components/ui/message";
import dayjs, { type Dayjs } from "dayjs";
import { LayoutGrid } from "lucide-react";
import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import CalendarView from "@/components/profile/calendar-view";
import AccountVerify from "@/components/schedule/account-verify";
import AppointmentCard from "@/components/schedule/appointment-card";
import AppointmentForm from "@/components/schedule/appointment-form";
import CancelSlotPopUp from "@/components/schedule/cancel-slot-pop-up";
import { useCancelPrompt } from "@/hooks/use-cancel-prompt";
import Loader from "@/components/ui/loader";
import { useSlotsContext } from "@/contexts/slots-context";
import cancelAppointment from "@/services/cancel-appointment";
import type { ServiceContext } from "@/services/client";
import type { Dashboard } from "@/types/content";
import type { Id } from "@/types/user";
import type { DoctorDashType } from "@/constants/dash-types";

// The last day the doctor looked at, if it is later this month.
function storedDate() {
  let saved: string | null = null;
  try {
    saved = window.localStorage.getItem("schedule_date");
  } catch {
    // Storage can be blocked (private mode).
  }
  const day = saved ? dayjs(saved) : null;
  const today = dayjs();
  return day?.isValid() && day.isAfter(today) && day.isSame(today, "month")
    ? day
    : today;
}

export default function ScheduleAppointments({
  doctorData,
  userid,
  isDoctorLoading,
  fetchUserData,
  offsetWidth,
  setDashType,
  socket,
  timeZone,
}: Pick<ServiceContext, "fetchUserData"> & {
  doctorData: Dashboard | null;
  userid?: Id;
  isDoctorLoading: boolean;
  offsetWidth?: number;
  setDashType: (type: DoctorDashType) => void;
  socket: Socket;
  timeZone: string;
}) {
  const [handleDrawer, setHandleDrawer] = useState(false);
  const { slotsData, isLoading, fetchSlotsData } = useSlotsContext();
  const [messageApi, contextHolder] = message.useMessage();
  const cancel = useCancelPrompt();
  // Position (from 1) of the slot being edited; null adds new slots.
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(storedDate);
  const isVerified = doctorData?.is_verified;
  const day = selectedDate.format("YYYY-MM-DD");

  useEffect(
    function () {
      if (userid) socket.emit("join_doctor", userid);
    },
    [socket, userid],
  );

  useEffect(
    function () {
      // Only verified doctors have a schedule; wait until that is known.
      if (!userid || isDoctorLoading || !isVerified) return;
      const doctorId = userid;
      function getSlots(data?: { date?: string }) {
        if (day === data?.date)
          void fetchSlotsData({ date: day, doctorId }, { silent: true });
      }
      socket.on("update_slots", getSlots);
      void fetchSlotsData({ date: day, doctorId });
      return function () {
        socket.off("update_slots", getSlots);
      };
    },
    [day, userid, fetchSlotsData, isDoctorLoading, isVerified, socket],
  );

  function handleDate(value: Dayjs | null) {
    if (!value) return;
    setSelectedDate(value);
    try {
      window.localStorage.setItem("schedule_date", value.format("YYYY-MM-DD"));
    } catch {
      // Storage can be blocked (private mode).
    }
  }

  const isUpToDate = !selectedDate.isBefore(dayjs(), "day");
  const tAppointments = slotsData?.totalSlots ?? [];
  const editAppointment =
    editIndex === null ? undefined : tAppointments[editIndex - 1];

  return (
    <div className="schedule--wrapper p-3 rounded">
      <div className="text-right my-1">
        <span
          onClick={function () {
            setDashType("appointments");
          }}
          className="cursor-pointer hover:bg-orange-800 font-medium text-white bg-orange-700 w-fit p-2 rounded-lg"
        >
          My Appointments
        </span>
      </div>
      <h1 className="text-center my-6 text-gray-700 text-xl sm:text-2xl xl:text-3xl 2xl:text-4xl mt-2">
        Schedule Your Appointments
      </h1>
      {contextHolder}
      <CalendarView
        offsetWidth={offsetWidth}
        selectedDate={selectedDate}
        handleDate={handleDate}
      />
      {userid && isUpToDate && !isLoading && !isDoctorLoading && isVerified ? (
        <>
          <div className="flex gap-2 flex-wrap">
            {tAppointments.map(function (slot, i) {
              return (
                <AppointmentCard
                  key={slot.appointmentId}
                  slot={slot}
                  order={i + 1}
                  fetchSlotsData={fetchSlotsData}
                  fetchUserData={fetchUserData}
                  selectedDate={selectedDate}
                  userid={userid}
                  messageApi={messageApi}
                  tAppointments={tAppointments}
                  onEdit={function (order) {
                    setEditIndex(order);
                    setHandleDrawer(true);
                  }}
                  onCancel={cancel.open}
                  timeZone={timeZone}
                  socket={socket}
                />
              );
            })}
            <div
              onClick={function () {
                setHandleDrawer(true);
              }}
              className="bg-gray-300/50 gap-2 hover:bg-gray-300/80 flex justify-center items-center h-24 text-center cursor-pointer text-gray-500 text-lg sm:text-xl xl:text-2xl font-medium rounded-lg hover:shadow-sm p-3 hover:text-gray-700 grow"
            >
              <LayoutGrid className="w-7 h-7" />
              New Appointments
            </div>
          </div>
          <Drawer
            open={handleDrawer}
            onClose={function () {
              setHandleDrawer(false);
              setTimeout(function () {
                setEditIndex(null);
              }, 500);
            }}
            closable
            classNames={{
              body: "p-0",
              wrapper: "w-full",
            }}
            title={
              editIndex === null
                ? "New Appointment"
                : `Edit Appointment ${String(editIndex)}`
            }
          >
            <AppointmentForm
              socket={socket}
              key={editIndex === null ? "new" : "edit"}
              editAppointment={editAppointment}
              selectedDate={selectedDate}
              messageApi={messageApi}
              tAppointments={tAppointments}
              userid={userid}
              fetchUserData={fetchUserData}
              fetchSlotsData={fetchSlotsData}
              timeZone={timeZone}
            />
          </Drawer>
        </>
      ) : (isLoading && isVerified) || isDoctorLoading ? (
        <Loader />
      ) : !isVerified ? (
        <AccountVerify isVerified={isVerified} />
      ) : (
        <Empty
          className="mt-2"
          description={
            <span className="font-medium text-black">
              choose a recent date (up to date)
            </span>
          }
        />
      )}
      <CancelSlotPopUp
        prompt={cancel.prompt}
        onClose={cancel.close}
        closeColor="text-red-800/80 hover:text-red-800"
        onConfirm={function (slot) {
          if (!userid) return;
          void cancelAppointment({
            date: day,
            slotTime: slot.slotTime,
            appointmentId: slot.appointmentId,
            doctorId: userid,
            cancelFrom: "doctor",
            socket,
            messageApi,
            fetchUserData,
          }).then(function (canceled) {
            if (!canceled) return;
            cancel.close();
            void fetchSlotsData({ date: day, doctorId: userid });
          });
        }}
      />
    </div>
  );
}
