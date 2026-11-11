import dayjs from "dayjs";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { SelectedDay } from "@/types/appointment";

function dayFromToday(count: number): SelectedDay {
  return { count, date: dayjs().add(count, "day").format("YYYY-MM-DD") };
}

export default function DatePicker({
  setSelectedDate,
  selectedDate,
  fromAppointment,
}: {
  setSelectedDate: Dispatch<SetStateAction<SelectedDay>>;
  selectedDate: SelectedDay;
  fromAppointment?: boolean;
}) {
  const day = new Date(selectedDate.date).toLocaleString("en-us", {
    weekday: "long",
  });

  const textColor = fromAppointment ? "text-gray-700" : "text-white";
  const arrow =
    "flex size-9 shrink-0 items-center justify-center rounded-xl shadow-lg";
  return (
    <div
      className={`${
        fromAppointment ? "bg-gray-200/80" : "bg-gray-500"
      } flex items-center gap-1 px-1 py-1`}
    >
      <button
        type="button"
        aria-label="Previous day"
        disabled={!selectedDate.count}
        onClick={function () {
          setSelectedDate(function (value) {
            return value.count ? dayFromToday(value.count - 1) : value;
          });
        }}
        className={`${arrow} ${
          selectedDate.count
            ? "bg-white hover:bg-gray-200"
            : "cursor-not-allowed bg-gray-300"
        }`}
      >
        <ChevronsLeft className="size-6" />
      </button>

      <div
        className={`min-w-0 grow text-center text-sm font-medium select-none ${textColor}`}
      >
        <div className="truncate">{day}</div>
        <div className="truncate">{selectedDate.date}</div>
      </div>

      <button
        type="button"
        aria-label="Next day"
        onClick={function () {
          setSelectedDate(function (value) {
            return dayFromToday(value.count + 1);
          });
        }}
        className={`${arrow} bg-white hover:bg-gray-200`}
      >
        <ChevronsRight className="size-6" />
      </button>
    </div>
  );
}
