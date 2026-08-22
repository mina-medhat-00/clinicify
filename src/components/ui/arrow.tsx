import { ChevronsDown } from "lucide-react";

export default function Arrow({ color, arrowColor }: any) {
  return (
    <ChevronsDown
      className={`mx-auto size-8 sm:size-10 ${
        arrowColor ? arrowColor : color ? color : "text-blue-400"
      }`}
    />
  );
}
