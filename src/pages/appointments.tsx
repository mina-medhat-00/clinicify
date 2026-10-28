import { Empty, Rate } from "@/components/ui/display";
import dayjs from "dayjs";
import {
  CheckCircle,
  CircleX,
  Clock,
  Hospital,
  Loader2,
  MessageCircle,
  Radio,
  Video,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import AppointmentStart from "@/components/appointment/appointment-start";
import AppointmentTime from "@/components/appointment/appointment-time";
import DoctorDetails from "@/components/appointment/doctor-details";
import DatePicker, { type SelectedDay } from "@/components/doctor/date-picker";
import CancelSlotPopUp from "@/components/schedule/cancel-slot-pop-up";
import { useCancelPrompt } from "@/hooks/use-cancel-prompt";
import Loader from "@/components/ui/loader";
import UserAvatar from "@/components/ui/user-avatar";
import { useAppointmentContext } from "@/contexts/appointment-context";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";
import cancelAppointment from "@/services/cancel-appointment";
import type { AppointmentKind, AppointmentState } from "@/types/appointment";

type StateFilter = AppointmentState | "total";

const stateColors: Record<AppointmentState, string> = {
  done: "bg-green-700/50",
  booked: "bg-yellow-600/50",
  canceled: "bg-red-700/50",
  free: "bg-blue-700/50",
  running: "bg-blue-800/50",
};

const stateIcons: Record<AppointmentState, ReactNode> = {
  done: <CheckCircle className="flex items-center text-yellow-200 size-6" />,
  booked: <Clock className="flex items-center text-yellow-200 size-6" />,
  canceled: <CircleX className="flex items-center text-yellow-200 size-6" />,
  free: (
    <Loader2 className="flex items-center text-yellow-200 size-6 animate-spin" />
  ),
  running: <Radio className="flex items-center size-6" />,
};

const typeIcons: Record<AppointmentKind, ReactNode> = {
  inClinic: <Hospital className="flex items-center text-gray-200 size-5" />,
  chat: <MessageCircle className="flex items-center text-gray-200 size-5" />,
  videoCall: <Video className="flex items-center text-gray-200 size-5" />,
};

const emptyClass =
  "p-2 m-0 mx-2 bg-gray-500 rounded-lg border flex flex-col justify-center h-80 border-white shadow-2xl";

export default function Appointments({ fromDash }: { fromDash?: boolean }) {
  const { messageApi, timeZone, socket } = useUtilsContext();
  const { userData: user, fetchUserData } = useUserContext();
  const [selectedDate, setSelectedDate] = useState<SelectedDay>(function () {
    return { count: 0, date: dayjs().format("YYYY-MM-DD") };
  });
  const [appointmentState, setAppointmentState] =
    useState<StateFilter>("total");
  const cancel = useCancelPrompt();
  const {
    appointmentData,
    isLoading,
    fetchAppointmentData,
    updateAppointment,
  } = useAppointmentContext();
  useEffect(
    function () {
      void fetchAppointmentData({ date: selectedDate.date });
    },
    [selectedDate.date, fetchAppointmentData],
  );
  if (isLoading) return <Loader />;
  const shown =
    appointmentData?.filter(function ({ appointment_state }) {
      return (
        appointmentState === "total" || appointment_state === appointmentState
      );
    }) ?? [];
  const tabs: { state: StateFilter; label: string }[] = [
    { state: "total", label: "Total Appointments" },
    { state: "booked", label: "Booked Appointments" },
    { state: "running", label: "Running Appointment" },
    ...(fromDash
      ? [{ state: "free" as const, label: "Free Appointments" }]
      : []),
  ];
  return (
    <div>
      <DatePicker
        fromAppointment
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
      <div
        className={`mt-4 flex flex-wrap ${
          fromDash ? "lg:flex-nowrap" : "sm:flex-nowrap"
        } gap-1 justify-evenly px-2 cursor-pointer text-white text-center text-sm xl:text-lg`}
      >
        {tabs.map(function ({ state, label }, i) {
          return (
            <div
              key={state}
              className={`flex items-center hover:shadow-xl ${
                appointmentState === state
                  ? "bg-yellow-500"
                  : "hover:bg-gray-600 bg-gray-800"
              } p-2 ${
                i === 0 ? (fromDash ? "lg:ml-2" : "sm:ml-2") : ""
              } rounded-t-2xl border-2 border-b-0 border-white`}
              onClick={function () {
                setAppointmentState(state);
              }}
            >
              {label}
            </div>
          );
        })}
        <div
          className={`ml-4 mr-4 w-full ${
            fromDash
              ? "lg:ml-auto lg:mr-2 lg:w-fit"
              : "sm:ml-auto sm:mr-2 sm:w-fit"
          } flex items-center justify-center bg-gray-600 rounded-t-2xl border-2 border-b-0 border-white`}
        >
          <UserAvatar src={user?.img_url} userType={user?.user_type} />
          <div className="text-white p-2 font-medium text-xl lg:text-2xl 2xl:text-4xl">
            {user?.nick_name}
          </div>
        </div>
      </div>
      {appointmentData ? (
        shown.length ? (
          <div className="flex flex-wrap gap-2">
            {shown.map(function ({
              patientId,
              doctorId,
              appointment_state,
              appointmentId,
              appointment_type,
              appointment_duration,
              slot_time,
              doctorName,
              rate,
              username,
              dimgUrl,
              uimgUrl,
              schedule_date,
              fees,
              specialty,
              clinic_city,
              clinic_street,
            }) {
              const isDoctor = user?.user_id === doctorId;
              return (
                <div
                  key={appointmentId}
                  className="appointment--container grow p-1 rounded-lg shadow-sm"
                >
                  <div className="flex flex-wrap gap-1.5 p-2 bg-gray-300 rounded-lg border border-white shadow-md">
                    <div
                      className={`appointment--details grow p-2 flex justify-between items-start border-2 border-white rounded-xl ${stateColors[appointment_state]}`}
                    >
                      <div className="grow flex h-full flex-wrap content-around">
                        <div className="appointment--head--details flex flex-wrap w-full justify-between mb-2">
                          <div className="text-white bg-gray-700/50 rounded-lg w-fit p-1 font-medium flex gap-2 mb-2">
                            {stateIcons[appointment_state]}
                            <span className="text-yellow-300 font-semibold">
                              Status:
                            </span>
                            <span className="font-medium">
                              {appointment_state.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-white bg-gray-700/50 rounded-lg w-fit p-1 font-medium flex gap-2 mb-2">
                            {typeIcons[appointment_type]}
                            <span className="font-medium">
                              {appointment_type.toUpperCase()}
                            </span>
                          </div>
                          {appointment_state === "booked" && !fromDash ? (
                            <div
                              onClick={function () {
                                cancel.open({
                                  slotTime: slot_time,
                                  appointmentId,
                                });
                              }}
                              className="cursor-pointer hover:bg-red-400/80 bg-red-400/50 rounded shadow-lg p-2"
                            >
                              <div className="flex gap-1 h-full justify-center items-center">
                                <span className="text-white font-medium">
                                  Cancel
                                </span>
                                <CircleX className="text-white size-4" />
                              </div>
                            </div>
                          ) : null}
                        </div>
                        <div className="w-full appointment--time">
                          <AppointmentTime
                            appointmentId={appointmentId}
                            appointment_duration={appointment_duration}
                            date={selectedDate.date}
                            patientId={patientId}
                            schedule_date={schedule_date}
                            doctorId={doctorId}
                            slot_time={slot_time}
                            appointment_state={appointment_state}
                            updateAppointment={updateAppointment}
                            timeZone={timeZone}
                            socket={socket}
                          />
                        </div>
                      </div>
                    </div>
                    {appointment_state !== "free" && (
                      <>
                        {appointment_state === "running" && (
                          <AppointmentStart
                            appointmentDetails={{
                              withNickName: isDoctor ? username : doctorName,
                              withId: isDoctor ? patientId : doctorId,
                              appointmentId,
                              appointment_state,
                              appointment_type,
                            }}
                          />
                        )}
                        <Link
                          to={`/profile/${String(fromDash ? patientId : doctorId)}`}
                          className="personal--details hover:shadow-md hover:bg-gray-300 p-2 border-2 border-white rounded-xl bg-gray-200 grow"
                        >
                          <div className="flex gap-3 flex-wrap justify-between md:justify-evenly items-center">
                            <div className="doctor--details">
                              <div className="personal--image flex gap-1">
                                <UserAvatar
                                  src={fromDash ? uimgUrl : dimgUrl}
                                  userType={fromDash ? "user" : "doctor"}
                                />
                                <span className="text-gray-700 font-medium sm:text-lg xl:text-xl">
                                  {fromDash
                                    ? username
                                      ? `patient. ${username}`
                                      : "free slot"
                                    : `Dr. ${doctorName}`}
                                </span>
                              </div>
                              <Rate
                                className="personal--rate"
                                value={Number(rate)}
                                disabled
                              />
                            </div>
                            {!fromDash && (
                              <DoctorDetails
                                data={[
                                  { label: "Clinic City", value: clinic_city },
                                  {
                                    label: "Clinic Street",
                                    value: clinic_street,
                                  },
                                  { label: "fees", value: fees },
                                  { label: "specialty", value: specialty },
                                ]}
                              />
                            )}
                          </div>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Empty
            className={emptyClass}
            description={
              <span className="text-white font-medium">
                there's no{" "}
                {appointmentState === "total" ? "" : appointmentState}{" "}
                Appointments
              </span>
            }
          />
        )
      ) : (
        <Empty
          className={emptyClass}
          description={
            <span className="text-white font-medium">
              cannot get your appointments, try again later!
            </span>
          }
        />
      )}
      <CancelSlotPopUp
        prompt={cancel.prompt}
        onClose={cancel.close}
        closeColor="text-red-800/80 hover:text-red-800"
        onConfirm={function (slot) {
          const appointment = appointmentData?.find(function (item) {
            return item.appointmentId === slot.appointmentId;
          });
          if (!appointment) return;
          void cancelAppointment({
            date: appointment.schedule_date,
            slotTime: slot.slotTime,
            appointmentId: slot.appointmentId,
            doctorId: appointment.doctorId,
            cancelFrom: "patient",
            socket,
            messageApi,
            fetchUserData,
          }).then(function (canceled) {
            if (!canceled) return;
            cancel.close();
            void fetchAppointmentData(
              { date: selectedDate.date },
              { silent: true },
            );
          });
        }}
      />
    </div>
  );
}
