import { ChevronLeft, ChevronRight } from "lucide-react";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { cx, hasWidthClass } from "@/components/ui/kit/cx";

function DatePicker({
  value,
  onChange,
  className,
  placeholder,
  disabled,
}: any) {
  return (
    <input
      type="date"
      disabled={disabled}
      placeholder={placeholder}
      className={cx(
        "rounded-md border border-gray-300 bg-white px-3 py-1.5 text-black/85 outline-none focus:border-blue-500",
        !hasWidthClass(className) && "w-full",
        className,
      )}
      value={value ? dayjs(value).format("YYYY-MM-DD") : ""}
      onChange={function (event) {
        onChange?.(event.target.value ? dayjs(event.target.value) : null);
      }}
    />
  );
}
DatePicker.displayName = "DatePicker";

function Calendar({ value, onSelect, fullscreen }: any) {
  const selected = value ? dayjs(value) : dayjs();
  const [cursor, setCursor] = useState(function () {
    return selected.startOf("month");
  });
  useEffect(
    function () {
      if (value) setCursor(dayjs(value).startOf("month"));
    },
    [value],
  );
  const weeks = useMemo(
    function () {
      const start = cursor.startOf("month").startOf("week");
      const days = [];
      for (let index = 0; index < 42; index += 1) {
        days.push(start.add(index, "day"));
      }
      const rows = [];
      for (let index = 0; index < 6; index += 1) {
        rows.push(days.slice(index * 7, index * 7 + 7));
      }
      return rows;
    },
    [cursor],
  );

  return (
    <div
      className={cx(
        "rounded-lg border border-gray-200 bg-white p-3",
        fullscreen && "p-6",
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={function () {
            setCursor(function (current) {
              return current.subtract(1, "month");
            });
          }}
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="font-medium">{cursor.format("MMMM YYYY")}</div>
        <button
          type="button"
          onClick={function () {
            setCursor(function (current) {
              return current.add(1, "month");
            });
          }}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(function (label) {
          return <div key={label}>{label}</div>;
        })}
      </div>
      <div className="mt-1 grid grid-cols-7 text-center">
        {weeks.flat().map(function (day) {
          const inMonth = day.month() === cursor.month();
          const isSelected = day.isSame(selected, "day");
          const isToday = day.isSame(dayjs(), "day");
          return (
            <button
              type="button"
              key={day.format("YYYY-MM-DD")}
              onClick={function () {
                onSelect?.(day);
              }}
              className={cx(
                "m-0.5 rounded-md",
                fullscreen ? "h-16" : "h-9",
                !inMonth && "text-gray-300",
                isSelected && "bg-blue-500 text-white",
                !isSelected && isToday && "border border-blue-400",
                !isSelected && inMonth && "hover:bg-blue-50",
              )}
            >
              {day.date()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { Calendar, DatePicker };
