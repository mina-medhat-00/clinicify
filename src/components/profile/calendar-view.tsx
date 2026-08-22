import { useState } from "react";
import { useMediaQuery } from "react-responsive";
import { Calendar, Checkbox, DatePicker } from "@/components/ui";

export default function CalendarView({
  offsetWidth,
  selectedDate,
  handleDate,
  colorView,
}: any) {
  const [calendarView, setCalendarView] = useState(false);
  const isMobile = useMediaQuery({
    query: `(max-width:${300 + (offsetWidth || 0)}px)`,
  });
  return !isMobile ? (
    <>
      <Checkbox
        onChange={function () {
          setCalendarView(function (val?: any) {
            return !val;
          });
        }}
      >
        <span className={`text-${colorView || "black"} font-bold`}>
          Large View
        </span>
      </Checkbox>
      <Calendar
        fullscreen={calendarView}
        value={selectedDate}
        onSelect={function (val?: any) {
          handleDate(val);
        }}
      />
    </>
  ) : (
    <DatePicker
      className="w-full mb-2"
      value={selectedDate}
      onChange={function (val?: any) {
        handleDate(val);
      }}
    />
  );
}
