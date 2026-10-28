import type { Dayjs } from "dayjs";
import { useState } from "react";
import { useMediaQuery } from "react-responsive";
import { Calendar, DatePicker } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/controls";

export default function CalendarView({
  offsetWidth = 0,
  selectedDate,
  handleDate,
}: {
  // Extra width (px) before switching to the compact date input.
  offsetWidth?: number;
  selectedDate: Dayjs | null;
  handleDate: (date: Dayjs | null) => void;
}) {
  const [calendarView, setCalendarView] = useState(false);
  const isMobile = useMediaQuery({
    query: `(max-width:${String(300 + offsetWidth)}px)`,
  });
  return !isMobile ? (
    <>
      <Checkbox
        onChange={function () {
          setCalendarView(function (value) {
            return !value;
          });
        }}
      >
        <span className="text-black font-bold">Large View</span>
      </Checkbox>
      <Calendar
        fullscreen={calendarView}
        value={selectedDate}
        onSelect={handleDate}
      />
    </>
  ) : (
    <DatePicker
      className="w-full mb-2"
      value={selectedDate}
      onChange={handleDate}
    />
  );
}
