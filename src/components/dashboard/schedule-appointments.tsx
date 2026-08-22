import { Drawer, Empty, message } from "@/components/ui/kit";
import dayjs from "dayjs";
import { LayoutGrid } from "lucide-react";
import { useEffect, useState } from "react";
import CalendarView from "@/components/profile/calendar-view";
import AccountVerify from "@/components/schedule/account-verify";
import AppointmentCard from "@/components/schedule/appointment-card";
import AppointmentForm from "@/components/schedule/appointment-form";
import Loader from "@/components/ui/loader";
import PopUp from "@/components/ui/pop-up";
import { useSlotsContext } from "@/contexts/slots-context";
import cancelAppointment from "@/services/cancel-appointment";
import scheduleAppointments from "@/services/schedule-appointments";

function ScheduleAppointments({
  doctorData,
  userid,
  isDoctorLoading,
  fetchUserData,
  offsetWidth,
  setDashType,
  socket,
  timeZone,
}: any) {
  const [handleDrawer, setHandleDrawer] = useState(false);
  const { slotsData, isLoading, fetchSlotsData } = useSlotsContext();
  const [messageApi, contextHolder] = message.useMessage();
  const [bookedAppointment, setBookedAppointment] = useState(null);
  const [showPop, setShowPop] = useState({ show: false, data: null });
  const [isAction, setIsAction] = useState<any>(false);
  const sDate = window?.localStorage?.getItem("schedule_date");
  const [selectedDate, setSelectedDate] = useState(function () {
    return sDate
      ? dayjs(sDate) > dayjs() &&
        dayjs(sDate).month() == dayjs().month() &&
        dayjs(sDate).year() == dayjs().year()
        ? dayjs(sDate)
        : dayjs()
      : dayjs();
  });
  const isVerified = doctorData?.is_verified;
  useEffect(function () {
    if (userid) socket.emit("join_doctor", userid);
  }, []);
  useEffect(
    function () {
      function getSlots(data?: any, ..._args: any[]) {
        if (selectedDate.format("YYYY-MM-DD") == data?.date)
          fetchSlotsData(
            {
              date: selectedDate.format("YYYY-MM-DD"),
              doctorId: userid,
            },
            true,
          );
      }
      if (
        userid &&
        selectedDate.format("YYYY-MM-DD") &&
        !(!isDoctorLoading && !isVerified)
      ) {
        socket.on("update_slots", getSlots);
        fetchSlotsData({
          date: selectedDate.format("YYYY-MM-DD"),
          doctorId: userid,
        });
      }
      return function () {
        socket?.off("all_slots", getSlots);
      };
    },
    [selectedDate, userid],
  );
  function handleDate(val?: any, ..._args: any[]) {
    setSelectedDate(val);
    window?.localStorage?.setItem("schedule_date", val?.format("YYYY-MM-DD"));
  }
  const isUpToDate =
    selectedDate?.toDate()?.setHours(0, 0, 0, 0) >=
    new Date().setHours(0, 0, 0, 0);
  const tAppointments = slotsData?.totalSlots;
  return (
    <div
      className={`schedule--wrapper
     p-3 rounded`}
    >
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
        colorView="black"
        selectedDate={selectedDate}
        handleDate={handleDate}
      />
      {isUpToDate && !isLoading && !isDoctorLoading && isVerified ? (
        <>
          <div className="flex gap-2 flex-wrap">
            {tAppointments?.map(function (
              {
                slotTime,
                appointmentState,
                appointmentType,
                appointmentFees,
                appointmentId,
              }: any,
              i?: any,
            ) {
              return (
                <AppointmentCard
                  key={i + 1}
                  fetchSlotsData={fetchSlotsData}
                  fetchUserData={fetchUserData}
                  selectedDate={selectedDate}
                  userid={userid}
                  messageApi={messageApi}
                  tAppointments={tAppointments}
                  slotTime={slotTime}
                  appointmentFees={appointmentFees}
                  appointmentState={appointmentState}
                  appointmentType={appointmentType}
                  appointmentId={appointmentId}
                  setIsEdit={setIsAction}
                  setHandleDrawer={setHandleDrawer}
                  order={i + 1}
                  scheduleAppointments={scheduleAppointments}
                  setBookedAppointment={setBookedAppointment}
                  setShowPop={setShowPop}
                  timeZone={timeZone}
                  socket={socket}
                />
              );
            })}
            <div
              onClick={function () {
                setHandleDrawer(true);
              }}
              className="bg-gray-300/50 gap-2 hover:bg-gray-300/80 flex justify-center items-center h-24 text-center cursor-pointer text-gray-500
           text-lg sm:text-xl xl:text-2xl font-medium rounded-lg hover:shadow-sm p-3 hover:text-gray-700 grow"
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
                setIsAction(false);
              }, 500);
            }}
            closable
            classNames={{
              body: "p-0",
              wrapper: "w-full",
            }}
            title={
              isAction ? `Edit Appointment ${isAction}` : "New Appointment"
            }
          >
            <AppointmentForm
              socket={socket}
              doctorData={doctorData}
              key={isAction ? 1 : 2}
              isEdit={isAction}
              editAppointment={tAppointments?.[isAction - 1] || []}
              selectedDate={selectedDate}
              messageApi={messageApi}
              tAppointments={tAppointments || []}
              userid={userid}
              isLoading={isLoading}
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
      {
        <PopUp
          show={showPop?.show}
          handleClose={function () {
            setShowPop(function (val?: any, ..._args: any[]) {
              return {
                ...val,
                show: false,
              };
            });
            setTimeout(function () {
              setShowPop(function (val?: any, ..._args: any[]) {
                return {
                  ...val,
                  data: null,
                };
              });
            }, 400);
          }}
          closeColor={"text-red-800/80 hover:text-red-800"}
        >
          <div className="text-center text-sm sm:text-lg p-2 bg-blue-400 text-white font-medium rounded-lg">
            {`${showPop?.data?.slotTime} already booked`}
            <br /> Are you sure that you want cancel it ?
          </div>
          <div className="flex justify-center gap-2 p-2 mt-4">
            <div
              onClick={function () {
                cancelAppointment(
                  selectedDate,
                  bookedAppointment?.slotTime,
                  bookedAppointment?.appointmentId,
                  messageApi,
                  fetchSlotsData,
                  userid,
                  setBookedAppointment,
                  "doctor",
                  fetchUserData,
                  null,
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
                setShowPop(function (val?: any, ..._args: any[]) {
                  return {
                    ...val,
                    show: false,
                  };
                });
                setTimeout(function () {
                  setShowPop(function (val?: any, ..._args: any[]) {
                    return {
                      ...val,
                      data: null,
                    };
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

export default ScheduleAppointments;
