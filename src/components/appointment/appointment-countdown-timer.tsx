import { useEffect, useState } from "react";
import { FlipNumber, type FlipPalette } from "@/components/ui/flip-clock";

const palette: FlipPalette = {
  top: "bg-gray-800",
  bottom: "bg-gray-600",
  width: "w-6 sm:w-10",
};

// Hours, minutes and seconds left until `targetDate`, ticking every second.
export default function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const target = targetDate.getTime();
  const [now, setNow] = useState(Date.now);
  useEffect(
    function () {
      const timer = setInterval(function () {
        const current = Date.now();
        setNow(current);
        if (current >= target) clearInterval(timer);
      }, 1000);
      return function () {
        clearInterval(timer);
      };
    },
    [target],
  );
  const secondsLeft = Math.max(Math.floor((target - now) / 1000), 0);
  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor(secondsLeft / 60) % 60;
  const seconds = secondsLeft % 60;
  const sectionClass = "text-gray-100 text-xs sm:text-sm";
  return (
    <div className="countdown w-full justify-center flex-wrap flex gap-2 sm:gap-4 pt-1">
      <FlipNumber
        value={hours}
        label="Hours"
        palette={palette}
        className={sectionClass}
      />
      <FlipNumber
        value={minutes}
        label="Minutes"
        palette={palette}
        className={sectionClass}
      />
      <FlipNumber
        value={seconds}
        label="Seconds"
        palette={palette}
        className={sectionClass}
      />
    </div>
  );
}
