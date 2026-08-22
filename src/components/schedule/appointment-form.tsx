import { Button, Input, Popover, Select } from "@/components/ui/kit";
import { Clock, Plus, PoundSterling, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import CountdownTimer from "@/components/schedule/schedule-countdown-timer";
import scheduleAppointments from "@/services/schedule-appointments";

function adjustHMin(val?: any, ..._args: any[]) {
  return val > 9 ? val : "0" + val;
}
function chkTimeSlot(data?: any, ..._args: any[]) {
  return data?.every(function (
    { slotTime: t1, appointmentDuration: duration1 }: any,
    i1?: any,
    ..._args: any[]
  ) {
    return data?.every(function (
      { slotTime: t2, appointmentDuration: duration2 }: any,
      i2?: any,
      ..._args: any[]
    ) {
      return i1 == i2
        ? true
        : new Date(`1970 ${t1}`).getTime() >=
            new Date(`1970 ${t2}`).getTime() + duration2 ||
            new Date(`1970 ${t1}`).getTime() + duration1 <=
              new Date(`1970 ${t2}`).getTime();
    });
  });
}
function chkUpToDate(data?: any, date?: any, timeZone?: any, ..._args: any[]) {
  return data?.every(function ({ slotTime: t }: any) {
    return (
      new Date(
        date?.format("YYYY-MM-DD") + " " + t + (timeZone || ""),
      ).getTime() > new Date().getTime() &&
      date?.date() ==
        new Date(
          date?.format("YYYY-MM-DD") + " " + t + (timeZone || ""),
        ).getDate()
    );
  });
}
function chkFillingData(data?: any, ..._args: any[]) {
  return !data?.some(function ({
    appointmentDuration,
    appointmentType,
    appointmentFees,
  }: any) {
    return !appointmentDuration || !appointmentType || !appointmentFees;
  });
}
function handleDetails(editAppointment?: any, ..._args: any[]) {
  return {
    ...editAppointment,
    slotTime: {
      h: parseInt(editAppointment?.slotTime),
      m: parseInt(editAppointment?.slotTime?.split(":")?.[1]),
      timeMode: editAppointment?.slotTime?.split(" ")?.[1],
    },
  };
}
function AppointmentDetails({
  doctorData,
  order,
  setAppointmentElements,
  appointmentElements,
  setAppointDetails,
  editAppointment,
  isEdit,
  schedule_date,
  timeZone,
}: any) {
  const [appointmentDetails, setAppointmentDetails] = useState(
    isEdit
      ? handleDetails(editAppointment)
      : {
          slotTime: {
            h: 1,
            m: 0,
            timeMode: "AM",
          },
          appointmentDuration: 30 * 60 * 1000,
          appointmentFees: doctorData?.fees || 300,
        },
  );
  useEffect(
    function () {
      return setAppointDetails(function (val?: any, ..._args: any[]) {
        val[order - 1] = {
          ...appointmentDetails,
          slotTime: `${adjustHMin(appointmentDetails.slotTime.h)}:${adjustHMin(
            appointmentDetails.slotTime.m,
          )} ${appointmentDetails.slotTime.timeMode}`,
        };
        return new Array(...val);
      });
    },
    [appointmentDetails],
  );
  return (
    <div className="grow bg-gray-100 p-2 rounded-lg shadow-sm border-2 border-gray-300">
      <div className="border-b-2 flex items-center justify-between border-gray-200 mb-2">
        <span className="font-medium text-white xl:text-lg bg-gray-500 inline-block my-2 rounded-lg p-2">
          Appointment {order}/{appointmentElements.length}
        </span>
        {appointmentElements.length > 1 && (
          <div
            onClick={function () {
              setAppointDetails(function (val?: any, ..._args: any[]) {
                val.splice(order - 1, 1);
                return new Array(...val);
              });
              setAppointmentElements(function (ele?: any, ..._args: any[]) {
                ele.splice(order - 1, 1);
                return new Array(...ele);
              });
            }}
          >
            <Trash2 className="w-10 h-10 hover:text-red-500 hover:bg-white text-red-400 border border-white shadow-lg rounded-lg p-2 cursor-pointer" />
          </div>
        )}
      </div>
      <div className="w-fit mb-2">
        <span className="font-medium text-gray-500 xl:text-lg">Time Slot</span>
        <hr className="border-gray-500 w-fill border-2" />
      </div>
      <div className="flex flex-wrap mb-2 justify-center">
        <CountdownTimer
          order={order}
          directMode={new Date(
            `${schedule_date} ${appointmentDetails?.slotTime?.h}:${appointmentDetails?.slotTime?.m}:${appointmentDetails?.slotTime?.timeMode} ${timeZone}`,
          )
            .toLocaleString()
            .slice(-2)}
          directHour={
            new Date(
              `${schedule_date} ${appointmentDetails?.slotTime?.h}:${appointmentDetails?.slotTime?.m}:${appointmentDetails?.slotTime?.timeMode} ${timeZone}`,
            ).getHours() % 12 || 12
          }
          timeZone={timeZone}
          appointmentDetails={appointmentDetails}
          setAppointmentDetails={setAppointmentDetails}
        />
        <div className="flex flex-wrap border-y mt-1 border-gray-300 justify-center items-center w-full gap-2">
          <div className="w-full sm:w-1/3 items-center justify-center grow gap-2">
            <div className="w-fit">
              <span className="font-medium text-gray-500 xl:text-lg">
                Appointment Duration
              </span>
              <hr className="border-gray-500 w-fill border-2" />
            </div>
            <div className="flex gap-2 items-center justify-center">
              <Clock className="w-5 h-5 sm:w-8 sm:h-8 text-gray-400" />
              <Select
                placeholder="Appointment Duration"
                className="my-2 w-full text-center"
                onChange={function (value?: any, ..._args: any[]) {
                  setAppointmentDetails(function (
                    appDet?: any,
                    ..._args: any[]
                  ) {
                    return {
                      ...appDet,
                      appointmentDuration: value,
                    };
                  });
                }}
                value={appointmentDetails?.appointmentDuration}
                options={[
                  {
                    label: "1.30 min",
                    value: 90 * 1000,
                  },
                  {
                    label: "15 min",
                    value: 15 * 60 * 1000,
                  },
                  {
                    label: "30 min",
                    value: 30 * 60 * 1000,
                  },
                  {
                    label: "45 min",
                    value: 45 * 60 * 1000,
                  },
                  {
                    label: "1 h",
                    value: 60 * 60 * 1000,
                  },
                  {
                    label: "1h 30m",
                    value: 90 * 60 * 1000,
                  },
                  {
                    label: "2h",
                    value: 120 * 60 * 1000,
                  },
                  {
                    label: "2h 30m",
                    value: 150 * 60 * 1000,
                  },
                  {
                    label: "3h",
                    value: 180 * 60 * 1000,
                  },
                ]}
              ></Select>
            </div>
          </div>
          <div className="w-full items-center justify-center grow gap-2">
            <div className="w-fit">
              <span className="font-medium text-gray-500 xl:text-lg">
                Appointment Fees
              </span>
              <hr className="border-gray-500 w-fill border-2" />
            </div>
            <div className="flex gap-2">
              <PoundSterling className="flex justify-center items-center text-xl sm:text-2xl text-gray-400" />
              <Input
                type="number"
                min={20}
                max={40000}
                name={`appointmentFees--${order}`}
                placeholder="Appointment Fees"
                className="w-full rounded-sm my-2 text-center"
                onChange={function (e?: any, ..._args: any[]) {
                  setAppointmentDetails(function (
                    appDet?: any,
                    ..._args: any[]
                  ) {
                    return {
                      ...appDet,
                      appointmentFees: e?.target?.value,
                    };
                  });
                }}
                value={appointmentDetails?.appointmentFees}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mb-2">
        <div className="w-fit">
          <span className="font-medium text-gray-500 xl:text-lg">
            Appointment Type
          </span>
          <hr className="border-gray-500 w-fill border-2" />
        </div>
        <div className="my-4 flex justify-center sm:flex-nowrap gap-4 sm:gap-6 border border-white bg-gray-200 p-2 rounded-lg shadow-md">
          <div
            onClick={function () {
              setAppointmentDetails(function (val?: any, ..._args: any[]) {
                return {
                  ...val,
                  appointmentType: "chat",
                };
              });
            }}
            className="flex cursor-pointer justify-center items-center gap-2"
          >
            <input
              onChange={function (e?: any, ..._args: any[]) {
                setAppointmentDetails(function (appDet?: any, ..._args: any[]) {
                  return {
                    ...appDet,
                    appointmentType: e.target.value,
                  };
                });
              }}
              name={`appointment_type_${order}`}
              type="radio"
              value={appointmentDetails.appointmentType}
              checked={
                appointmentDetails.appointmentType == "chat" ? true : false
              }
              className="h-4 w-4 cursor-pointer bg-gray"
            />
            <label className="text-gray-700 cursor-pointer font-medium">
              Chating
            </label>
          </div>
          <div
            onClick={function () {
              setAppointmentDetails(function (val?: any, ..._args: any[]) {
                return {
                  ...val,
                  appointmentType: "inClinic",
                };
              });
            }}
            className="flex cursor-pointer justify-center items-center gap-2"
          >
            <input
              type="radio"
              name={`appointment_type_${order}`}
              value="inClinic"
              checked={
                appointmentDetails.appointmentType == "inClinic" ? true : false
              }
              onChange={function (e?: any, ..._args: any[]) {
                setAppointmentDetails(function (appDet?: any, ..._args: any[]) {
                  return {
                    ...appDet,
                    appointmentType: e.target.value,
                  };
                });
              }}
              className="h-4 w-4 cursor-pointer bg-gray-500"
            />
            <label className="text-gray-700 cursor-pointer font-medium">
              in Clinic
            </label>
          </div>
          <div
            onClick={function () {
              setAppointmentDetails(function (val?: any, ..._args: any[]) {
                return {
                  ...val,
                  appointmentType: "videoCall",
                };
              });
            }}
            className="flex cursor-pointer justify-center items-center gap-2"
          >
            <input
              type="radio"
              name={`appointment_type_${order}`}
              value="videoCall"
              checked={
                appointmentDetails.appointmentType == "videoCall" ? true : false
              }
              onChange={function (e?: any, ..._args: any[]) {
                setAppointmentDetails(function (appDet?: any, ..._args: any[]) {
                  return {
                    ...appDet,
                    appointmentType: e.target.value,
                  };
                });
              }}
              className="h-4 w-4 cursor-pointer bg-gray-500"
            />
            <label className="text-gray-700 cursor-pointer font-medium">
              Video Call
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
function AppointmentForm({
  doctorData,
  selectedDate,
  messageApi,
  fetchSlotsData,
  userid,
  fetchUserData,
  tAppointments,
  isEdit,
  editAppointment,
  socket,
  timeZone,
}: any) {
  const [appointmentDetails, setAppointmentDetails] = useState([]);
  const [isDone, setIsDone] = useState(false);
  const [appointmentElements, setAppointmentElements] = useState([
    <AppointmentDetails />,
  ]);
  const isFilled = chkFillingData(appointmentDetails);
  const isAdjusted = chkTimeSlot([
    ...appointmentDetails,
    ...(isEdit
      ? (tAppointments?.filter(function ({ appointmentId }: any) {
          return appointmentId !== editAppointment?.appointmentId;
        }) ?? [])
      : (tAppointments ?? [])),
  ]);
  const isUpToDate = chkUpToDate(appointmentDetails, selectedDate, timeZone);
  const isNotMatched = isEdit
    ? appointmentDetails.some(function ({
        slotTime,
        appointmentDuration,
        appointmentFees,
        appointmentType,
      }: any) {
        return !(
          editAppointment?.appointmentFees == appointmentFees &&
          editAppointment?.appointmentType == appointmentType &&
          editAppointment?.appointmentDuration == appointmentDuration &&
          editAppointment?.slotTime == slotTime
        );
      })
    : true;
  useEffect(
    function () {
      setIsDone(function () {
        return isFilled && isAdjusted && isUpToDate && isNotMatched;
      });
    },
    [isFilled, isAdjusted, isUpToDate, isNotMatched],
  );
  return (
    <div className="p-2 sm:p-4">
      <div className="scroll--h scroll--v overflow-auto max-h-96">
        <div className="flex flex-wrap gap-2">
          {appointmentElements.map(function (
            ele?: any,
            i?: any,
            ..._args: any[]
          ) {
            return React.cloneElement(ele, {
              order: i + 1,
              key: i + 1,
              isEdit,
              editAppointment,
              appointmentElements,
              setAppointmentElements,
              setAppointDetails: setAppointmentDetails,
              schedule_date: selectedDate?.format("YYYY-MM-YY"),
              timeZone,
            });
          })}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {!isEdit && (
          <div className="text-left">
            <div
              onClick={function () {
                setAppointmentElements(function (val?: any, ..._args: any[]) {
                  return [
                    ...val,
                    <AppointmentDetails doctorData={doctorData} />,
                  ];
                });
              }}
              className="inline-block sm:w-fit text-center cursor-pointer hover:bg-gray-600 p-2 text-white font-medium bg-gray-500 rounded-lg"
            >
              <div className="flex gap-2">
                <Plus className="text-2xl" />
                <span>other appointment</span>
              </div>
            </div>
          </div>
        )}
        <Popover
          arrow={false}
          color="cyan"
          placement="bottomLeft"
          trigger={isDone ? [] : "click"}
          open={!isDone ? null : false}
          content={
            !chkFillingData(appointmentDetails) ? (
              <span className="text-white font-medium">
                please, fill your information
              </span>
            ) : !isUpToDate ? (
              <span className="text-white font-medium">
                please choose a recent date
              </span>
            ) : !isAdjusted ? (
              <span className="text-white font-medium">
                try to fix timing spaces between new appointments times
              </span>
            ) : !isNotMatched ? (
              <span className="text-white font-medium">
                do any changes to edit
              </span>
            ) : (
              <span className="text-white font-medium">
                your appointments scheduled
              </span>
            )
          }
        >
          <Button
            onClick={function () {
              if (isDone) {
                scheduleAppointments(
                  selectedDate,
                  appointmentDetails,
                  tAppointments,
                  messageApi,
                  fetchSlotsData,
                  userid,
                  fetchUserData,
                  setIsDone,
                  null,
                  isEdit,
                  [editAppointment?.appointmentId],
                  socket,
                );
              }
            }}
            type="primary"
            className={`m-auto mt-2 w-full sm:w-fit font-medium h-10 grow block ${
              !isDone
                ? "bg-gray-50/50 text-gray-500 border-gray-400"
                : "hover:bg-blue-700 bg-blue-400"
            } rounded-lg`}
          >
            {isEdit ? "Edit Now" : "Add Now"}
          </Button>
        </Popover>
      </div>
    </div>
  );
}

export default AppointmentForm;
