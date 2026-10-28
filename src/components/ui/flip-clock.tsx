import { useState } from "react";
import { cx } from "@/utils/cx";

export interface FlipPalette {
  // Background of the upper and lower halves.
  top: string;
  bottom: string;
  // Width of one digit card.
  width: string;
  // A shorter flip, for values the user changes by hand.
  fast?: boolean;
}

// One digit card that flips down to its new value. While it flips, the
// upper half already shows the new value and the lower half the old one;
// the CSS on `.flip` animates the overlay between them.
function FlipDigit({
  value,
  palette,
}: {
  value: number;
  palette: FlipPalette;
}) {
  const [settled, setSettled] = useState(value);
  const flipping = settled !== value;
  return (
    <div
      className={cx(
        "time-segment block font-black text-2xl sm:text-3xl",
        palette.width,
      )}
    >
      <div className="segment-display relative h-full">
        <div
          className={cx(
            "segment-display__top relative h-1/2 w-full overflow-hidden text-center leading-normal text-neutral-200",
            palette.top,
          )}
        >
          {value}
        </div>
        <div
          className={cx(
            "segment-display__bottom relative h-1/2 w-full overflow-hidden text-center leading-none text-white",
            palette.bottom,
          )}
        >
          {settled}
        </div>
        <div
          className={cx(
            "segment-overlay absolute top-0 h-full perspective-normal",
            palette.width,
            palette.fast && "segment-overlay-slot",
            flipping && "flip",
          )}
          onAnimationEnd={function () {
            setSettled(value);
          }}
        >
          <div
            className={cx(
              "segment-overlay__top absolute top-0 h-1/2 w-full origin-bottom overflow-hidden text-center leading-normal text-white",
              palette.top,
            )}
          >
            {settled}
          </div>
          <div
            className={cx(
              "segment-overlay__bottom absolute bottom-0 h-1/2 w-full origin-top overflow-hidden text-center leading-none text-neutral-200",
              palette.bottom,
            )}
          >
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

// A two-digit value (0-99) with a caption, e.g. "05 Minutes".
export function FlipNumber({
  value,
  label,
  palette,
  className,
}: {
  value: number;
  label: string;
  palette: FlipPalette;
  className?: string;
}) {
  return (
    <div className={cx("time-section text-center", className)}>
      <div className="time-group flex gap-1">
        <FlipDigit value={Math.floor(value / 10) % 10} palette={palette} />
        <FlipDigit value={value % 10} palette={palette} />
      </div>
      <p className="mb-0">{label}</p>
    </div>
  );
}
