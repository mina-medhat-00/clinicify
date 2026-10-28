import { Ban } from "lucide-react";
import type { ReactNode } from "react";

export default function DoctorDetails({
  data,
}: {
  data: { label: string; value: ReactNode }[];
}) {
  return (
    <div className="flex md:flex-col flex-wrap gap-3 justify-end items-center">
      {data.map(function ({ label, value }) {
        return (
          <div
            key={label}
            className="doctor--more--details shadow-lg bg-gray-300 rounded p-2"
          >
            <span className="capitalize text-gray-700 font-medium sm:text-sm xl:text-base">
              {label}:{" "}
              <span className="text-gray-500">
                {value === null || value === undefined || value === "" ? (
                  <Ban />
                ) : (
                  value
                )}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
