import { ChevronsDown } from "lucide-react";

export default function Arrow({
  color,
  arrowColor,
}: {
  color?: string;
  arrowColor?: string;
}) {
  return (
    <ChevronsDown
      className={`mx-auto size-8 sm:size-10 ${arrowColor ?? color ?? "text-blue-400"}`}
    />
  );
}
