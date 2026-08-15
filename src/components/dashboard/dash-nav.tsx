import { Popover } from "antd";
import { useState } from "react";
import { AiOutlineSchedule } from "react-icons/ai";
import { ImProfile, ImStatsDots } from "react-icons/im";
import { RiQuestionAnswerLine } from "react-icons/ri";
import { useMediaQuery } from "react-responsive";

const DashNav = ({ setDashType, dashType }: any) => {
  const items = [
    {
      name: "profile",
      icon: <ImProfile className="w-full text-lg sm:text-2xl" />,
    },
    {
      name: "schedule",
      icon: <AiOutlineSchedule className="w-full text-lg sm:text-2xl" />,
    },
    {
      name: "appointments",
      icon: <ImProfile className="w-full text-lg sm:text-2xl" />,
    },
    {
      name: "chat",
      icon: <RiQuestionAnswerLine className="w-full text-lg sm:text-2xl" />,
    },
    {
      name: "statistics",
      icon: <ImStatsDots className="w-full text-lg sm:text-2xl" />,
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
        {items?.map(({ icon, name }: any, i?: any, ..._args: any[]) => (
          <Popover
            placement={isMobile ? "rightBottom" : undefined}
            key={i}
            arrow={!isMobile}
            content={<span className="text-white">{name}</span>}
            color="blue-inverse"
            styles={{
              container: {
                backgroundColor: "#4a5568",
                fontWeight: "500",
              },
            }}
          >
            <div
              onClick={() => {
                window.localStorage.setItem("dashType", name);
                setDashType(name);
              }}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
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
        ))}
        <div
          className={`absolute bg-gray-600 opacity-0 transition-[opacity,left,top] duration-500 ${
            isMobile
              ? "top-0 left-full h-1/5 w-0.75"
              : "top-full left-0 h-0.75 w-1/5"
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
};

export default DashNav;
