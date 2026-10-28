import { useState, type ReactNode } from "react";
import { useMediaQuery } from "react-responsive";
import {
  Calendar,
  ChartColumn,
  MessageCircleQuestion,
  User,
} from "lucide-react";
import { Popover } from "@/components/ui/overlay";
import type { DoctorDashType } from "@/constants/dash-types";

const items: { name: DoctorDashType; icon: ReactNode }[] = [
  {
    name: "profile",
    icon: <User className="w-full text-lg sm:text-2xl" />,
  },
  {
    name: "schedule",
    icon: <Calendar className="w-full text-lg sm:text-2xl" />,
  },
  {
    name: "appointments",
    icon: <User className="w-full text-lg sm:text-2xl" />,
  },
  {
    name: "chat",
    icon: <MessageCircleQuestion className="w-full text-lg sm:text-2xl" />,
  },
  {
    name: "statistics",
    icon: <ChartColumn className="w-full text-lg sm:text-2xl" />,
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
  // The underline moves to the hovered tab (each tab is 20% wide).
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
                  dashType === name ? "bg-yellow-600" : "hover:bg-gray-400"
                } ${
                  isMobile
                    ? "w-full px-3 py-6 text-xs font-medium"
                    : "w-1/5 grow p-3"
                } text-white sm:text-sm sm:font-medium lg:text-lg`}
              >
                <button
                  type="button"
                  className={`w-full h-full ${
                    dashType === name ? "" : "hover:text-gray-700"
                  }`}
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
