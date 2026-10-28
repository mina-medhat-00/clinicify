import { Button, Input, Select } from "@/components/ui/controls";
import { Popover } from "@/components/ui/overlay";
import type { Dayjs } from "dayjs";
import { Clock, Plus, PoundSterling, Trash2 } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { Socket } from "socket.io-client";
import TimeSlotPicker, {
  type SlotTimeParts,
  type TimeMode,
} from "@/components/schedule/schedule-countdown-timer";
import type { LoadOptions, ServiceContext } from "@/services/client";
import scheduleAppointments from "@/services/schedule-appointments";
import type { SlotsQuery } from "@/contexts/slots-context";
import type { AppointmentKind, Slot } from "@/types/appointment";
import type { Id } from "@/types/user";

const DEFAULT_FEES = 300;
const MINUTE = 60 * 1000;

const durationOptions = [
  { label: "1.30 min", value: 90 * 1000 },
  { label: "15 min", value: 15 * MINUTE },
  { label: "30 min", value: 30 * MINUTE },
  { label: "45 min", value: 45 * MINUTE },
  { label: "1 h", value: 60 * MINUTE },
  { label: "1h 30m", value: 90 * MINUTE },
  { label: "2h", value: 120 * MINUTE },
  { label: "2h 30m", value: 150 * MINUTE },
  { label: "3h", value: 180 * MINUTE },
];

const typeOptions: { value: AppointmentKind; label: string }[] = [
  { value: "chat", label: "Chating" },
  { value: "inClinic", label: "in Clinic" },
  { value: "videoCall", label: "Video Call" },
];

// A slot as the API takes it ("hh:mm AM").
export interface SlotDraft {
  slotTime: string;
  appointmentDuration: number;
  appointmentFees: number | string;
  appointmentType?: AppointmentKind;
  appointmentId?: Id;
}

// The same slot while it is edited, with its time split up.
type BlockValues = Omit<SlotDraft, "slotTime"> & { slotTime: SlotTimeParts };

function twoDigits(value: number) {
  return String(value).padStart(2, "0");
}

function joinTime({ h, m, timeMode }: SlotTimeParts) {
  return `${twoDigits(h)}:${twoDigits(m)} ${timeMode}`;
}

// "03:30 PM" -> { h: 3, m: 30, timeMode: "PM" }
function splitTime(slotTime: string): SlotTimeParts {
  const [clock = "", mode] = slotTime.split(" ");
  const [h = "1", m = "0"] = clock.split(":");
  return {
    h: parseInt(h, 10) || 1,
    m: parseInt(m, 10) || 0,
    timeMode: mode === "PM" ? "PM" : "AM",
  };
}

function startOf(slotTime: string) {
  return new Date(`1970 ${slotTime}`).getTime();
}

// No two slots overlap.
function chkTimeSlot(
  slots: Pick<SlotDraft, "slotTime" | "appointmentDuration">[],
) {
  return slots.every(function (a, i1) {
    return slots.every(function (b, i2) {
      return (
        i1 === i2 ||
        startOf(a.slotTime) >= startOf(b.slotTime) + b.appointmentDuration ||
        startOf(a.slotTime) + a.appointmentDuration <= startOf(b.slotTime)
      );
    });
  });
}

// Every slot starts in the future and on the chosen day.
function chkUpToDate(slots: SlotDraft[], date: Dayjs | null, timeZone: string) {
  if (!date) return false;
  return slots.every(function ({ slotTime }) {
    const start = new Date(
      `${date.format("YYYY-MM-DD")} ${slotTime}${timeZone}`,
    );
    return start.getTime() > Date.now() && date.date() === start.getDate();
  });
}

function chkFillingData(slots: SlotDraft[]) {
  return slots.every(function ({
    appointmentDuration,
    appointmentType,
    appointmentFees,
  }) {
    return Boolean(appointmentDuration && appointmentType && appointmentFees);
  });
}

// The slot's start on the viewer's own clock.
function localClock(
  date: string | undefined,
  { h, m, timeMode }: SlotTimeParts,
  timeZone: string,
): { hour: number; mode: TimeMode } {
  const start = new Date(
    `${date ?? ""} ${String(h)}:${String(m)}:${timeMode} ${timeZone}`,
  );
  if (Number.isNaN(start.getTime())) return { hour: h, mode: timeMode };
  return {
    hour: start.getHours() % 12 || 12,
    mode: start.getHours() >= 12 ? "PM" : "AM",
  };
}

function AppointmentDetails({
  order,
  setAppointmentElements,
  appointmentElements,
  setAppointDetails,
  editAppointment,
  schedule_date,
  timeZone,
}: {
  order: number;
  setAppointmentElements: Dispatch<SetStateAction<number[]>>;
  appointmentElements: number[];
  setAppointDetails: Dispatch<SetStateAction<SlotDraft[]>>;
  editAppointment?: Slot;
  schedule_date?: string;
  timeZone: string;
}) {
  const [appointmentDetails, setAppointmentDetails] = useState<BlockValues>(
    function () {
      return editAppointment
        ? { ...editAppointment, slotTime: splitTime(editAppointment.slotTime) }
        : {
            slotTime: { h: 1, m: 0, timeMode: "AM" },
            appointmentDuration: 30 * MINUTE,
            appointmentFees: DEFAULT_FEES,
          };
    },
  );
  // Report this block's values to the form (also after its position changes).
  useEffect(
    function () {
      setAppointDetails(function (all) {
        const next = [...all];
        next[order - 1] = {
          ...appointmentDetails,
          slotTime: joinTime(appointmentDetails.slotTime),
        };
        return next;
      });
    },
    [appointmentDetails, order, setAppointDetails],
  );
  function update(values: Partial<BlockValues>) {
    setAppointmentDetails(function (current) {
      return { ...current, ...values };
    });
  }
  const shown = localClock(
    schedule_date,
    appointmentDetails.slotTime,
    timeZone,
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
              function withoutThis(_: unknown, i: number) {
                return i !== order - 1;
              }
              setAppointDetails(function (all) {
                return all.filter(withoutThis);
              });
              setAppointmentElements(function (ids) {
                return ids.filter(withoutThis);
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
        <TimeSlotPicker
          value={appointmentDetails.slotTime}
          onChange={function (slotTime) {
            update({ slotTime });
          }}
          shownHour={shown.hour}
          shownMode={shown.mode}
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
              <Select<number>
                placeholder="Appointment Duration"
                className="my-2 w-full text-center"
                onChange={function (value) {
                  update({ appointmentDuration: value });
                }}
                value={appointmentDetails.appointmentDuration}
                options={durationOptions}
              />
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
                name={`appointmentFees--${String(order)}`}
                placeholder="Appointment Fees"
                className="w-full rounded-sm my-2 text-center"
                onChange={function (event) {
                  update({ appointmentFees: event.target.value });
                }}
                value={appointmentDetails.appointmentFees}
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
          {typeOptions.map(function ({ value, label }) {
            return (
              <div
                key={value}
                onClick={function () {
                  update({ appointmentType: value });
                }}
                className="flex cursor-pointer justify-center items-center gap-2"
              >
                <input
                  type="radio"
                  name={`appointment_type_${String(order)}`}
                  value={value}
                  checked={appointmentDetails.appointmentType === value}
                  onChange={function () {
                    update({ appointmentType: value });
                  }}
                  className="h-4 w-4 cursor-pointer bg-gray-500"
                />
                <label className="text-gray-700 cursor-pointer font-medium">
                  {label}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AppointmentForm({
  selectedDate,
  messageApi,
  fetchSlotsData,
  userid,
  fetchUserData,
  tAppointments,
  editAppointment,
  socket,
  timeZone,
}: ServiceContext & {
  selectedDate: Dayjs | null;
  fetchSlotsData: (
    query: SlotsQuery,
    options?: LoadOptions,
  ) => Promise<unknown>;
  userid: Id;
  // The day's current slots.
  tAppointments: Slot[];
  // The slot being edited; without it the form adds new slots.
  editAppointment?: Slot;
  socket: Socket;
  timeZone: string;
}) {
  const isEdit = editAppointment !== undefined;
  const [appointmentDetails, setAppointmentDetails] = useState<SlotDraft[]>([]);
  // One stable id per appointment block, so removing a block keeps the
  // others' inputs attached to the right block.
  const nextId = useRef(1);
  const [appointmentElements, setAppointmentElements] = useState<number[]>([0]);
  const isFilled = chkFillingData(appointmentDetails);
  const isAdjusted = chkTimeSlot([
    ...appointmentDetails,
    ...tAppointments.filter(function ({ appointmentId }) {
      return appointmentId !== editAppointment?.appointmentId;
    }),
  ]);
  const isUpToDate = chkUpToDate(appointmentDetails, selectedDate, timeZone);
  const isNotMatched = editAppointment
    ? appointmentDetails.some(function ({
        slotTime,
        appointmentDuration,
        appointmentFees,
        appointmentType,
      }) {
        return !(
          String(editAppointment.appointmentFees) === String(appointmentFees) &&
          editAppointment.appointmentType === appointmentType &&
          editAppointment.appointmentDuration === appointmentDuration &&
          editAppointment.slotTime === slotTime
        );
      })
    : true;
  const isDone = isFilled && isAdjusted && isUpToDate && isNotMatched;
  const scheduleDate = selectedDate?.format("YYYY-MM-DD");
  return (
    <div className="p-2 sm:p-4">
      <div className="scroll--h scroll--v overflow-auto max-h-96">
        <div className="flex flex-wrap gap-2">
          {appointmentElements.map(function (id, i) {
            return (
              <AppointmentDetails
                key={id}
                order={i + 1}
                editAppointment={editAppointment}
                appointmentElements={appointmentElements}
                setAppointmentElements={setAppointmentElements}
                setAppointDetails={setAppointmentDetails}
                schedule_date={scheduleDate}
                timeZone={timeZone}
              />
            );
          })}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {!isEdit && (
          <div className="text-left">
            <div
              onClick={function () {
                const id = nextId.current;
                nextId.current += 1;
                setAppointmentElements(function (ids) {
                  return [...ids, id];
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
          color="cyan"
          placement="bottomLeft"
          trigger={isDone ? [] : "click"}
          open={!isDone ? null : false}
          content={
            <span className="text-white font-medium">
              {!isFilled
                ? "please, fill your information"
                : !isUpToDate
                  ? "please choose a recent date"
                  : !isAdjusted
                    ? "try to fix timing spaces between new appointments times"
                    : !isNotMatched
                      ? "do any changes to edit"
                      : "your appointments scheduled"}
            </span>
          }
        >
          <Button
            onClick={function () {
              if (!isDone || !scheduleDate) return;
              void scheduleAppointments({
                date: scheduleDate,
                doctorId: userid,
                addedAppointments: appointmentDetails,
                totalSlots: tAppointments,
                isEdit,
                editSlot: [editAppointment?.appointmentId],
                socket,
                messageApi,
                fetchUserData,
              }).then(function () {
                // Reload either way: on a conflict the list shows which slots are taken.
                void fetchSlotsData(
                  { date: scheduleDate, doctorId: userid },
                  { silent: true },
                );
              });
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
