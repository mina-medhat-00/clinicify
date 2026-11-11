import { useState, type ReactNode } from "react";
import { useMediaQuery } from "react-responsive";
import {
  Calendar,
  ChartColumn,
  MessageCircleQuestion,
  User,
} from "lucide-react";
import { Popover } from "@/components/ui/overlay";
import type { DoctorDashType } from "@/types/dashboard";

const items: { name: DoctorDashType; icon: ReactNode }[] = [
  {
    name: "profile",
    icon: <User className="mx-auto size-5 sm:size-6" />,
  },
  {
    name: "schedule",
    icon: <Calendar className="mx-auto size-5 sm:size-6" />,
  },
  {
    name: "appointments",
    icon: <User className="mx-auto size-5 sm:size-6" />,
  },
  {
    name: "chat",
    icon: <MessageCircleQuestion className="mx-auto size-5 sm:size-6" />,
  },
  {
    name: "statistics",
    icon: <ChartColumn className="mx-auto size-5 sm:size-6" />,
  },
];

export default function DashNav({
  setDashType,
  dashType,
}: {
  setDashType: (type: DoctorDashType) => void;
  dashType: DoctorDashType;
}) {
  const isMobile = useMediaQuery({
    query: "(max-width:678px)",
  });
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  // Underline follows the hovered tab and each tab is 20% wide
  const offset = `${String((hoverIdx ?? 0) * 20)}%`;
  return (
    <div
      className={`relative z-10 flex shrink-0 flex-col bg-gray-500 ${
        isMobile ? "border-r" : "h-fit border-y-2"
      }`}
    >
      <div
        className={`relative flex cursor-pointer flex-wrap ${
          isMobile ? "flex-col justify-start" : "w-full"
        }`}
      >
        {items.map(function ({ icon, name }, i) {
          return (
            <Popover
              placement={isMobile ? "right" : undefined}
              key={name}
              content={<span className="text-white">{name}</span>}
              color="blue-inverse"
              className="bg-gray-600 font-medium"
              rootClassName={isMobile ? "w-full" : "w-1/5 grow"}
            >
              <div
                onClick={function () {
                  setDashType(name);
                }}
                onMouseEnter={function () {
                  setHoverIdx(i);
                }}
                onMouseLeave={function () {
                  setHoverIdx(null);
                }}
                className={`box-border flex flex-wrap hover:underline sm:hover:no-underline hover:shadow-md ${
                  dashType === name
                    ? "bg-amber-400 text-gray-900"
                    : "text-white hover:bg-gray-600"
                } ${
                  isMobile
                    ? "w-full px-3 py-6 text-xs font-medium"
                    : "w-full p-3"
                } sm:text-sm sm:font-medium lg:text-lg`}
              >
                <button
                  type="button"
                  aria-label={name}
                  className="h-full w-full"
                >
                  {icon}
                </button>
              </div>
            </Popover>
          );
        })}
        <div
          className={`absolute bg-gray-600 transition-all duration-500 ${
            isMobile ? "left-full h-1/5 w-1" : "top-full h-1 w-1/5"
          }`}
          style={{
            opacity: hoverIdx === null ? 0 : 1,
            ...(isMobile ? { top: offset } : { left: offset }),
          }}
        ></div>
      </div>
    </div>
  );
}
