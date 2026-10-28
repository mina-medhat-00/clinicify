import type { ReactNode } from "react";
import { cx } from "@/utils/cx";

// Full class names so Tailwind can find them; "no" leaves the size unset.
const textSizes = { sm: "text-sm", lg: "text-lg", no: "" } as const;
const fontWeights = { medium: "font-medium", bold: "font-bold" } as const;

export default function HeaderLine({
  font = "bold",
  value,
  size = "lg",
  imp,
  classLine,
  classText,
  center,
  invisible,
}: {
  font?: keyof typeof fontWeights;
  value?: ReactNode;
  size?: keyof typeof textSizes;
  imp?: boolean;
  classLine?: string;
  classText?: string;
  center?: boolean;
  invisible?: boolean;
}) {
  return (
    <>
      <span
        className={cx(
          "inline-block text-white",
          textSizes[size],
          fontWeights[font],
          center && "w-full text-center",
          classText,
        )}
      >
        {imp && <span className="text-red-600">* </span>} {value}
      </span>
      {!invisible && <hr className={classLine ?? "border-2 mt-1 mb-4"} />}
    </>
  );
}
