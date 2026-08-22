import { Popover } from "@/components/ui/kit";
import {
  Calendar,
  ChartColumn,
  MessageCircleQuestion,
  User,
} from "lucide-react";
import { useState } from "react";
import { useMediaQuery } from "react-responsive";

function DashNav({ setDashType, dashType }: any) {
  const items = [
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
  const isMobile = useMediaQuery({
    query: "(max-width:678px)",
  });
  const [hoverIdx, setHoverIdx] = useState(null);
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
        {items?.map(function ({ icon, name }: any, i?: any, ..._args: any[]) {
          return (
            <Popover
              placement={isMobile ? "rightBottom" : undefined}
              key={i}
              arrow={!isMobile}
              content={<span className="text-white">{name}</span>}
              color="blue-inverse"
              classNames={{
                container: "bg-gray-600 font-medium",
              }}
            >
              <div
                onClick={function () {
                  window.localStorage.setItem("dashType", name);
                  setDashType(name);
                }}
                onMouseEnter={function () {
                  setHoverIdx(i);
                }}
                onMouseLeave={function () {
                  setHoverIdx(null);
                }}
                className={`box-border flex flex-wrap hover:underline sm:hover:no-underline hover:shadow-md ${
                  dashType == name ? "bg-yellow-600" : "hover:bg-gray-400"
                } ${
                  isMobile
                    ? "w-full px-3 py-6 text-xs font-medium"
                    : "w-1/5 grow p-3"
                } text-white sm:text-sm sm:font-medium lg:text-lg`}
              >
                <button
                  className={`w-full h-full  ${
                    dashType == name ? "" : "hover:text-gray-700"
                  }`}
                >
                  {icon}
                </button>
              </div>
            </Popover>
          );
        })}
        <div
          className={`absolute bg-gray-600 opacity-0 transition-all duration-500 ${
            isMobile ? "top-0 left-full h-1/5 w-1" : "top-full left-0 h-1 w-1/5"
          }`}
          style={
            hoverIdx == null
              ? undefined
              : isMobile
                ? { top: `${hoverIdx * 20}%`, opacity: 1 }
                : { left: `${hoverIdx * 20}%`, opacity: 1 }
          }
        ></div>
      </div>
    </div>
  );
}

export default DashNav;
