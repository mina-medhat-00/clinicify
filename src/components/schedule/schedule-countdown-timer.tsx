import { Clock, SquareArrowDown, SquareArrowUp } from "lucide-react";
import { FlipNumber, type FlipPalette } from "@/components/ui/flip-clock";

export type TimeMode = "AM" | "PM";

// A slot's start as the doctor sets it: 12-hour clock plus AM/PM.
export interface SlotTimeParts {
  h: number;
  m: number;
  timeMode: TimeMode;
}

const palette: FlipPalette = {
  top: "bg-blue-800",
  bottom: "bg-blue-500",
  width: "w-6 sm:w-8",
  fast: true,
};

function otherMode(mode: TimeMode): TimeMode {
  return mode === "AM" ? "PM" : "AM";
}

// 11 -> 12 and 12 -> 11 cross noon/midnight, so AM/PM flips there.
function stepHour(parts: SlotTimeParts, delta: 1 | -1): SlotTimeParts {
  const h = ((parts.h - 1 + delta + 12) % 12) + 1;
  const crosses = (delta === 1 && h === 12) || (delta === -1 && h === 11);
  return {
    ...parts,
    h,
    timeMode: crosses ? otherMode(parts.timeMode) : parts.timeMode,
  };
}

function stepMinute(parts: SlotTimeParts, delta: 1 | -1): SlotTimeParts {
  return { ...parts, m: (parts.m + delta + 60) % 60 };
}

const arrowClass =
  "cursor-pointer sm:h-6 sm:w-6 h-5 w-5 rounded-lg text-gray-500";
const sectionClass = "text-gray-700 font-medium text-xs sm:text-sm";

// Picks a slot's start time. The cards show `shownHour`/`shownMode`, the
// same time on the viewer's clock.
export default function TimeSlotPicker({
  value,
  onChange,
  shownHour,
  shownMode,
}: {
  value: SlotTimeParts;
  onChange: (next: SlotTimeParts) => void;
  shownHour: number;
  shownMode: TimeMode;
}) {
  return (
    <div className="countdown w-full flex justify-center flex-wrap sm:flex-nowrap gap-4 pt-1">
      <Clock className="flex justify-center items-center w-0 sm:w-8 sm:h-8 text-gray-400" />
      <div className="flex gap-2 mb-4 sm:mb-0 justify-center">
        <div className="flex flex-col gap-1">
          <SquareArrowUp
            onClick={function () {
              onChange(stepHour(value, 1));
            }}
            className={arrowClass}
          />
          <SquareArrowDown
            onClick={function () {
              onChange(stepHour(value, -1));
            }}
            className={arrowClass}
          />
        </div>
        <FlipNumber
          value={shownHour}
          label="Hour"
          palette={palette}
          className={sectionClass}
        />
      </div>
      <div className="flex gap-2 justify-center">
        <div className="flex flex-col gap-1">
          <SquareArrowUp
            onClick={function () {
              onChange(stepMinute(value, 1));
            }}
            className={arrowClass}
          />
          <SquareArrowDown
            onClick={function () {
              onChange(stepMinute(value, -1));
            }}
            className={arrowClass}
          />
        </div>
        <FlipNumber
          value={value.m}
          label="Minute"
          palette={palette}
          className={sectionClass}
        />
      </div>
      <div className="flex gap-2 select-none">
        <div className="flex flex-col gap-1">
          <SquareArrowUp
            onClick={function () {
              onChange({ ...value, timeMode: otherMode(value.timeMode) });
            }}
            className="cursor-pointer h-5 w-5 rounded-lg text-gray-500"
          />
          <SquareArrowDown
            onClick={function () {
              onChange({ ...value, timeMode: otherMode(value.timeMode) });
            }}
            className="cursor-pointer h-5 w-5 rounded-lg text-gray-500"
          />
        </div>
        <span className="text-2xl sm:text-3xl text-blue-500 font-medium">
          {shownMode}
        </span>
      </div>
    </div>
  );
}
