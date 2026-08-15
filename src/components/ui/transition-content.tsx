import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { data } from "@/utils/data-trans";

const TransitionContent = ({
  id = "",
  children,
  parentClassName,
  direction = "left",
  first,
  customStyle = {},
  speed = "slow",
}: any) => {
  const timeId = useRef(null);
  const showingUp = data;
  const dir =
    direction == "top" || direction == "bottom"
      ? ["top"]
      : direction.includes("top") || direction.includes("bottom")
        ? ["left", "top"]
        : ["left"];
  const [showContent, setShowContent] = useState(false);

  const showingUpFunc = useCallback(function showingUpFunc(
    e?: any,
    _step: any = 150,
    offset: any = 0,
  ) {
    const handleTrans = () => {
      const ele = document.getElementById(showingUp?.[direction]?.id + id);
      const eleHeight = ele?.offsetHeight;
      const windowHeight = window.innerHeight;
      const eleDistanceFromVP =
        ele?.getBoundingClientRect()?.y +
        (direction.includes("bottom") || direction?.includes("top")
          ? -parseFloat(ele?.style?.top)
          : 0);
      if (
        eleDistanceFromVP - windowHeight <= 0 &&
        -eleDistanceFromVP <= eleHeight - offset
      ) {
        if (first) window.removeEventListener("scroll", showingUpFunc);
        setShowContent(true);
      } else setShowContent(false);
    };
    if (direction?.includes("top") || direction?.includes("bottom")) {
      clearTimeout(timeId.current);
      timeId.current = setTimeout(() => handleTrans(), 50);
    } else handleTrans();
  }, []);

  useEffect(() => {
    showingUpFunc();
    window.addEventListener("scroll", showingUpFunc);
    return () => window.removeEventListener("scroll", showingUpFunc);
  }, []);

  return (
    <div
      className={`relative ${parentClassName}`}
      id={showingUp?.[direction]?.id + id}
      style={{
        opacity: showContent ? "1" : showingUp?.[direction]?.opacity,
        [dir?.[0]]: showContent ? "0px" : `${showingUp[direction][dir?.[0]]}`,
        [dir?.[1]]: showContent ? "0px" : `${showingUp[direction][dir?.[1]]}`,
        transition: showContent
          ? `left ${
              speed == "slow"
                ? 1
                : speed == "medium"
                  ? 0.8
                  : speed == "speed"
                    ? 0.6
                    : 0.3
            }s linear,top ${
              speed == "slow"
                ? 1
                : speed == "medium"
                  ? 0.8
                  : speed == "speed"
                    ? 0.6
                    : 0.3
            }s linear,opacity ${
              speed == "slow"
                ? 2
                : speed == "medium"
                  ? 1.5
                  : speed == "speed"
                    ? 1
                    : 0.6
            }s ease-out`
          : "none",
        ...customStyle,
      }}
    >
      {children}
    </div>
  );
};

export default TransitionContent;
