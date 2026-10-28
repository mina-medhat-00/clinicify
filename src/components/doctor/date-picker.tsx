import dayjs from "dayjs";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

// `count` days from today; `date` is that day as "YYYY-MM-DD".
export interface SelectedDay {
  count: number;
  date: string;
}

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

  return (
    <div
      className={`${
        fromAppointment ? "bg-gray-200/80" : "bg-gray-500"
      } flex items-center`}
    >
      <ChevronsLeft
        onClick={function () {
          setSelectedDate(function (value) {
            return value.count ? dayFromToday(value.count - 1) : value;
          });
        }}
        className={`${
          selectedDate.count
            ? "bg-white hover:bg-gray-200"
            : "bg-gray-300 cursor-not-allowed"
        } rounded-xl h-10 w-10 shadow-lg ml-1`}
      />

      <div className="text-center grow">
        <div
          className={`font-medium select-none ${
            fromAppointment ? "text-gray-700" : "text-white"
          }`}
        >
          {day}
        </div>
        <div
          className={`font-medium select-none ${
            fromAppointment ? "text-gray-700" : "text-white"
          }`}
        >
          {selectedDate.date}
        </div>
      </div>

      <ChevronsRight
        onClick={function () {
          setSelectedDate(function (value) {
            return dayFromToday(value.count + 1);
          });
        }}
        className="bg-white rounded-xl hover:bg-gray-200 h-10 w-10 shadow-lg mr-1"
      />
    </div>
  );
}
