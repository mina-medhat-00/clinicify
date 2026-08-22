import { Empty, Rate } from "@/components/ui/kit";
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
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Cookies from "universal-cookie";
import AppointmentStart from "@/components/appointment/appointment-start";
import AppointmentTime from "@/components/appointment/appointment-time";
import DoctorDetails from "@/components/appointment/doctor-details";
import DatePicker from "@/components/doctor/date-picker";
import Loader from "@/components/ui/loader";
import PopUp from "@/components/ui/pop-up";
import UserAvatar from "@/components/ui/user-avatar";
import { useAppointmentContext } from "@/contexts/appointment-context";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";
import cancelAppointment from "@/services/cancel-appointment";

function chkEmpty(
  appointmentState?: any,
  appointmentData?: any,
  ..._args: any[]
) {
  return appointmentState == "total"
    ? false
    : !appointmentData?.some(function ({ appointment_state }: any) {
        return appointmentState == appointment_state;
      });
}
function getAppointmentVal(
  appointment_state?: any,
  valDone?: any,
  valBooked?: any,
  valCanceled?: any,
  valFree?: any,
  valRunning?: any,
  valDefault?: any,
) {
  return appointment_state == "done"
    ? valDone
    : appointment_state == "booked"
      ? valBooked
      : appointment_state == "canceled"
        ? valCanceled
        : appointment_state == "free"
          ? valFree
          : appointment_state == "running"
            ? valRunning
            : valDefault;
}
function Appointments({ fromDash }: any) {
  const { messageApi, timeZone, socket } = useUtilsContext();
  const { userData: user, fetchUserData } = useUserContext();
  const [selectedDate, setSelectedDate] = useState(function () {
    return {
      count: 0,
      date: dayjs().format("YYYY-MM-DD"),
    };
  });
  const [appointmentState, setAppointmentState] = useState("total");
  const [showPop, setShowPop] = useState({ show: false, data: null });
  const [cancelAppoint, setCancelAppoint] = useState<any>(null);
  const { appointmentData, isLoading, fetchAppointmentData } =
    useAppointmentContext();
  useEffect(
    function () {
      fetchAppointmentData(true, new Cookies().get("accessToken"), null, null, {
        date: selectedDate.date,
      });
    },
    [selectedDate.date],
  );
  const nickname = user?.nick_name;
  const uimg = user?.img_url;
  if (isLoading) return <Loader />;
  const isEmpty = chkEmpty(appointmentState, appointmentData);
  return (
    <div>
      <DatePicker
        fromAppointment
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
      <div
        className={`mt-4 flex flex-wrap ${
          fromDash ? "lg" : "sm"
        }:flex-nowrap gap-1 justify-evenly px-2 cursor-pointer text-white text-center text-sm xl:text-lg`}
      >
        <div
          className={`flex  items-center hover:shadow-xl ${
            appointmentState == "total"
              ? "bg-yellow-500"
              : "hover:bg-gray-600 bg-gray-800"
          } p-2 ${fromDash ? "lg:ml-2" : "sm:ml-2"} rounded-t-2xl border-2 border-b-0 border-white`}
          onClick={function () {
            setAppointmentState("total");
          }}
        >
          Total Appointments
        </div>
        <div
          className={`flex items-center hover:shadow-xl ${
            appointmentState == "booked"
              ? "bg-yellow-500"
              : "hover:bg-gray-600 bg-gray-800"
          } p-2 rounded-t-2xl border-2 border-b-0 border-white`}
          onClick={function () {
            setAppointmentState("booked");
          }}
        >
          Booked Appointments
        </div>
        <div
          className={`flex items-center hover:shadow-xl ${
            appointmentState == "running"
              ? "bg-yellow-500"
              : "hover:bg-gray-600 bg-gray-800"
          } p-2 rounded-t-2xl border-2 border-b-0 border-white`}
          onClick={function () {
            setAppointmentState("running");
          }}
        >
          Running Appointment
        </div>
        {fromDash && (
          <div
            className={`flex items-center hover:shadow-xl ${
              appointmentState == "free"
                ? "bg-yellow-500"
                : "hover:bg-gray-600 bg-gray-800"
            } p-2 rounded-t-2xl border-2 border-b-0 border-white`}
            onClick={function () {
              setAppointmentState("free");
            }}
          >
            Free Appointments
          </div>
        )}
        <div
          className={`ml-4 mr-4 w-full ${
            fromDash
              ? "lg:ml-auto lg:mr-2 lg:w-fit"
              : "sm:ml-auto sm:mr-2 sm:w-fit"
          } flex items-center justify-center bg-gray-600 rounded-t-2xl border-2 border-b-0 border-white`}
        >
          <UserAvatar src={uimg} userType={user?.user_type} />
          <div className="text-white p-2 font-medium text-xl lg:text-2xl 2xl:text-4xl">
            {nickname}
          </div>
        </div>
      </div>
      {appointmentData ? (
        appointmentData?.length != 0 && !isEmpty ? (
          <div className="flex flex-wrap gap-2">
            {appointmentData?.map(function (
              {
                patientId,
                doctorId,
                appointment_state,
                appointment_id,
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
              }: any,
              i?: any,
            ) {
              return (
                (appointment_state == appointmentState ||
                  appointmentState == "total") && (
                  <div
                    key={i}
                    className={`appointment--container grow p-1 rounded-lg shadow-sm`}
                  >
                    <div
                      className={`flex flex-wrap  gap-1.5 p-2 bg-gray-300 rounded-lg border border-white shadow-md`}
                    >
                      <div
                        className={`appointment--details grow p-2 flex justify-between items-start
                      border-2 border-white rounded-xl ${getAppointmentVal(
                        appointment_state,
                        "bg-green-700/50",
                        "bg-yellow-600/50",
                        "bg-red-700/50",
                        "bg-blue-700/50",
                        "bg-blue-800/50",
                      )}`}
                      >
                        <div className="grow flex h-full flex-wrap content-around">
                          <div className="appointment--head--details flex flex-wrap w-full justify-between mb-2">
                            <div className="text-white bg-gray-700/50 rounded-lg w-fit p-1 font-medium flex gap-2 mb-2">
                              {getAppointmentVal(
                                appointment_state,
                                <CheckCircle className="flex items-center text-yellow-200 size-6" />,
                                <Clock className="flex items-center text-yellow-200 size-6" />,
                                <CircleX className="flex items-center text-yellow-200 size-6" />,
                                <Loader2 className="flex items-center text-yellow-200 size-6 animate-spin" />,
                                <Radio className="flex items-center size-6" />,
                              )}
                              <span className="text-yellow-300 font-semibold">
                                Status:
                              </span>
                              <span className="font-medium">
                                {appointment_state.toUpperCase()}
                              </span>
                            </div>
                            <div className="text-white bg-gray-700/50 rounded-lg w-fit p-1 font-medium flex gap-2 mb-2">
                              {appointment_type == "inClinic" ? (
                                <Hospital className="flex items-center text-gray-200 size-5" />
                              ) : appointment_type == "chat" ? (
                                <MessageCircle className="flex items-center text-gray-200 size-5" />
                              ) : appointment_type == "videoCall" ? (
                                <Video className="flex items-center text-gray-200 size-5" />
                              ) : null}
                              <span className="font-medium">
                                {appointment_type?.toUpperCase()}
                              </span>
                            </div>
                            {appointment_state == "booked" && !fromDash ? (
                              <div
                                onClick={function () {
                                  setCancelAppoint({
                                    selectedDate: dayjs(schedule_date),
                                    bookedSlot: slot_time,
                                    doctorId,
                                    appointmentId: appointment_id,
                                  });
                                  setShowPop(function () {
                                    return {
                                      show: true,
                                      data: {
                                        selectedDate: dayjs(schedule_date),
                                        bookedSlot: slot_time,
                                        doctorId,
                                        appointmentId: appointment_id,
                                      },
                                    };
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
                              appointmentId={appointment_id}
                              appointment_duration={appointment_duration}
                              date={selectedDate.date}
                              patientId={patientId}
                              schedule_date={schedule_date}
                              doctorId={doctorId}
                              slot_time={slot_time}
                              appointment_state={appointment_state}
                              appointmentData={appointmentData}
                              getAppointmentVal={getAppointmentVal}
                              fetchAppointmentData={fetchAppointmentData}
                              order={i}
                              timeZone={timeZone || ""}
                              socket={socket}
                            />
                          </div>
                        </div>
                      </div>
                      {appointment_state !== "free" && (
                        <>
                          {appointment_state == "running" && (
                            <AppointmentStart
                              appointmentDetails={{
                                withNickName:
                                  user?.user_id == doctorId
                                    ? username
                                    : doctorName,
                                withId:
                                  user?.user_id == doctorId
                                    ? patientId
                                    : doctorId,
                                patientId,
                                appointment_id,
                                doctorId,
                                appointment_state,
                                appointment_type,
                              }}
                            />
                          )}
                          <Link
                            to={`/profile/${fromDash ? patientId : doctorId}`}
                            className="personal--details hover:shadow-md hover:bg-gray-300 p-2 
                        border-2 border-white rounded-xl bg-gray-200 grow"
                          >
                            <div className="flex gap-3 flex-wrap justify-between md:justify-evenly items-center">
                              <div className="doctor--details">
                                <div className="personal--image flex gap-1">
                                  <UserAvatar
                                    src={fromDash ? uimgUrl : dimgUrl}
                                    userType={fromDash ? "user" : "doctor"}
                                  />
                                  <span className="text-gray-700 font-medium  sm:text-lg xl:text-xl">
                                    {fromDash
                                      ? username
                                        ? `patient. ${username}`
                                        : "free slot"
                                      : `Dr. ${doctorName}`}
                                  </span>
                                </div>

                                <Rate
                                  className="personal--rate"
                                  value={rate}
                                  disabled
                                />
                              </div>
                              {!fromDash && (
                                <DoctorDetails
                                  data={[
                                    {
                                      label: "Clinic City",
                                      value: clinic_city,
                                    },
                                    {
                                      label: "Clinic Street",
                                      value: clinic_street,
                                    },
                                    {
                                      label: "fees",
                                      value: fees,
                                    },
                                    {
                                      label: "specialty",
                                      value: specialty,
                                    },
                                  ]}
                                />
                              )}
                            </div>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                )
              );
            })}
          </div>
        ) : (
          <Empty
            className="p-2 m-0 mx-2 bg-gray-500 rounded-lg border 
            flex flex-col justify-center
            h-80 border-white shadow-2xl"
            description={
              <span className="text-white font-medium">
                there's no {appointmentState == "total" ? "" : appointmentState}{" "}
                Appointments
              </span>
            }
          />
        )
      ) : (
        <Empty
          className="p-2 m-0 mx-2 bg-gray-500 rounded-lg border 
        flex flex-col justify-center
        h-80 border-white shadow-2xl"
          description={
            <span className="text-white font-medium">
              cannot get your appointments, try again later!
            </span>
          }
        ></Empty>
      )}
      {
        <PopUp
          show={showPop?.show}
          handleClose={function () {
            setShowPop(function (val) {
              return { data: val?.data, show: false };
            });
            setTimeout(function () {
              setShowPop(function () {
                return { show: false, data: null };
              });
            }, 400);
          }}
          closeColor={"text-red-800/80 hover:text-red-800"}
        >
          <div className="text-center text-sm sm:text-lg p-2 bg-blue-400 text-white font-medium rounded-lg">
            {`${showPop?.data?.bookedSlot} already booked`}
            <br /> Are you sure that you want cancel it ?
          </div>
          <div className="flex justify-center gap-2 p-2 mt-4">
            <div
              onClick={function () {
                cancelAppointment(
                  cancelAppoint?.selectedDate,
                  cancelAppoint?.bookedSlot,
                  cancelAppoint?.appointmentId,
                  messageApi,
                  fetchAppointmentData,
                  cancelAppoint?.doctorId,
                  setCancelAppoint,
                  "patient",
                  fetchUserData,
                  selectedDate.date,
                  setShowPop,
                  socket,
                );
              }}
              className="cursor-pointer text-center bg-red-500 p-2 grow text-white font-medium rounded-lg shadow-sm"
            >
              Apply
            </div>
            <div
              onClick={function () {
                setShowPop(function (val) {
                  return { ...val, show: false };
                });
                setTimeout(function () {
                  setShowPop(function (val) {
                    return { ...val, data: null };
                  });
                }, 400);
              }}
              className="cursor-pointer text-center bg-blue-400 p-2 text-white font-medium rounded-lg shadow-sm"
            >
              Cancel
            </div>
          </div>
        </PopUp>
      }
    </div>
  );
}

export default Appointments;
