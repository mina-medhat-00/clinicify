import { Loader2 } from "lucide-react";

export default function Loader({ gray }: any) {
  return (
    <div className="my-4 flex w-full items-center justify-center">
      <Loader2
        className={`size-10 animate-spin ${gray ? "text-gray-600" : "text-blue-700"}`}
      />
    </div>
  );
}
