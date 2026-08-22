import { useEffect } from "react";
import { Clock, SquareArrowDown, SquareArrowUp } from "lucide-react";

function handleHours(value?: any, type?: any, setAppointmentDetails?: any) {
  if (value + 1 == 12 && type == "inc")
    setAppointmentDetails(function (appDet?: any) {
      return {
        ...appDet,
        slotTime: {
          ...appDet.slotTime,
          timeMode: appDet.slotTime.timeMode == "AM" ? "PM" : "AM",
        },
      };
    });
  else if (value - 1 == 11 && type == "dec")
    setAppointmentDetails(function (appDet?: any) {
      return {
        ...appDet,
        slotTime: {
          ...appDet.slotTime,
          timeMode: appDet.slotTime.timeMode == "AM" ? "PM" : "AM",
        },
      };
    });
  return type == "inc"
    ? (value + 1) % 13 == 0
      ? 1
      : (value + 1) % 13
    : type == "dec"
      ? value - 1 == 0
        ? 12
        : value - 1
      : 1;
}
function handleMinutes(value?: any, type?: any) {
  return type == "inc"
    ? (value + 1) % 60
    : type == "dec"
      ? !value
        ? 59
        : value - 1
      : 0;
}
function getTimeSegmentElements(segmentElement?: any) {
  const segmentDisplay = segmentElement.querySelector(`.segment-display`);
  const segmentDisplayTop = segmentDisplay.querySelector(
    `.segment-display__top`,
  );
  const segmentDisplayBottom = segmentDisplay.querySelector(
    `.segment-display__bottom`,
  );

  const segmentOverlay = segmentDisplay.querySelector(`.segment-overlay`);
  const segmentOverlayTop = segmentOverlay.querySelector(
    `.segment-overlay__top`,
  );
  const segmentOverlayBottom = segmentOverlay.querySelector(
    `.segment-overlay__bottom`,
  );

  return {
    segmentDisplayTop,
    segmentDisplayBottom,
    segmentOverlay,
    segmentOverlayTop,
    segmentOverlayBottom,
  };
}

function updateSegmentValues(
  displayElement?: any,
  overlayElement?: any,
  value?: any,
) {
  displayElement.textContent = value;
  overlayElement.textContent = value;
}

function updateTimeSegment(segmentElement?: any, timeValue?: any) {
  const segmentElements = getTimeSegmentElements(segmentElement);
  if (
    parseInt(segmentElements.segmentDisplayTop.textContent, 10) === timeValue
  ) {
    return;
  }

  segmentElements.segmentOverlay.classList.add("flip");

  updateSegmentValues(
    segmentElements.segmentDisplayTop,
    segmentElements.segmentOverlayBottom,
    timeValue,
  );

  function finishAnimation() {
    segmentElements.segmentOverlay.classList.remove("flip");
    updateSegmentValues(
      segmentElements.segmentDisplayBottom,
      segmentElements.segmentOverlayTop,
      timeValue,
    );

    this.removeEventListener("animationend", finishAnimation);
  }

  segmentElements.segmentOverlay.addEventListener(
    "animationend",
    finishAnimation,
  );
}

function updateTimeSection(sectionID?: any, timeValue?: any) {
  const firstNumber = Math.floor(timeValue / 10) || 0;
  const secondNumber = timeValue % 10 || 0;
  const sectionElement = document.getElementById(sectionID);
  const timeSegments = sectionElement.querySelectorAll(`.time-segment`);
  updateTimeSegment(timeSegments[0], firstNumber);
  updateTimeSegment(timeSegments[1], secondNumber);
}

function updateAllSegments(
  hours?: any,
  minutes?: any,
  order?: any,
  directHour?: any,
) {
  updateTimeSection(`minutes--${order}`, minutes);
  updateTimeSection(`hours--${order}`, directHour || hours);
}
export default function CountdownTimer({
  order,
  appointmentDetails,
  setAppointmentDetails,
  directMode,
  directHour,
}: any) {
  useEffect(
    function () {
      updateAllSegments(
        appointmentDetails.slotTime.h,
        appointmentDetails.slotTime.m,
        order,
        directHour,
      );
    },
    [
      directHour,
      appointmentDetails.slotTime.h,
      appointmentDetails.slotTime.m,
      order,
    ],
  );

  return (
    <div className="countdown w-full flex justify-center flex-wrap sm:flex-nowrap gap-4 pt-1">
      <Clock className="flex justify-center items-center w-0 sm:w-8 sm:h-8 text-gray-400" />
      <div className="flex gap-2 mb-4 sm:mb-0 justify-center">
        <div className="flex flex-col gap-1">
          <SquareArrowUp
            onClick={function () {
              const h = handleHours(
                appointmentDetails.slotTime.h,
                "inc",
                setAppointmentDetails,
              );
              updateAllSegments(
                h,
                appointmentDetails.slotTime.m,
                order,
                directHour,
              );
              setAppointmentDetails(function (appDet?: any) {
                return {
                  ...appDet,
                  slotTime: {
                    ...appDet.slotTime,
                    h,
                  },
                };
              });
            }}
            className="cursor-pointer sm:h-6 sm:w-6 h-5 w-5 rounded-lg text-gray-500"
          />
          <SquareArrowDown
            onClick={function () {
              const h = handleHours(
                appointmentDetails.slotTime.h,
                "dec",
                setAppointmentDetails,
              );
              updateAllSegments(
                h,
                appointmentDetails.slotTime.m,
                order,
                directHour,
              );
              setAppointmentDetails(function (appDet?: any) {
                return {
                  ...appDet,
                  slotTime: {
                    ...appDet.slotTime,
                    h,
                  },
                };
              });
            }}
            className="cursor-pointer sm:h-6 sm:w-6 h-5 w-5 rounded-lg text-gray-500"
          />
        </div>
        <div
          className="time-section text-center text-gray-700 font-medium text-xs sm:text-sm"
          id={`hours--${order}`}
        >
          <div className="time-group flex gap-1">
            <div
              className={`time-segment block font-black w-6 sm:w-8 text-2xl sm:text-3xl`}
            >
              <div className={`segment-display relative h-full`}>
                <div className="segment-display__top relative h-1/2 w-full overflow-hidden text-center leading-normal text-neutral-200 bg-blue-800"></div>
                <div className="segment-display__bottom relative h-1/2 w-full overflow-hidden text-center leading-none text-white bg-blue-500"></div>
                <div
                  className={`segment-overlay segment-overlay-slot absolute top-0 h-full perspective-normal w-6 sm:w-8`}
                >
                  <div className="segment-overlay__top absolute top-0 h-1/2 w-full origin-bottom overflow-hidden text-center leading-normal text-white bg-blue-800"></div>
                  <div className="segment-overlay__bottom absolute bottom-0 h-1/2 w-full origin-top overflow-hidden text-center leading-none text-neutral-200 bg-blue-500">
                    {" "}
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`time-segment block font-black w-6 sm:w-8 text-2xl sm:text-3xl`}
            >
              <div className={`segment-display relative h-full`}>
                <div className="segment-display__top relative h-1/2 w-full overflow-hidden text-center leading-normal text-neutral-200 bg-blue-800"></div>
                <div className="segment-display__bottom relative h-1/2 w-full overflow-hidden text-center leading-none text-white bg-blue-500"></div>
                <div
                  className={`segment-overlay segment-overlay-slot absolute top-0 h-full perspective-normal w-6 sm:w-8`}
                >
                  <div className="segment-overlay__top absolute top-0 h-1/2 w-full origin-bottom overflow-hidden text-center leading-normal text-white bg-blue-800"></div>
                  <div className="segment-overlay__bottom absolute bottom-0 h-1/2 w-full origin-top overflow-hidden text-center leading-none text-neutral-200 bg-blue-500"></div>
                </div>
              </div>
            </div>
          </div>
          <p className="mb-0">Hour</p>
        </div>
      </div>
      <div className="flex gap-2 justify-center">
        <div className="flex flex-col gap-1">
          <SquareArrowUp
            onClick={function () {
              const m = handleMinutes(appointmentDetails.slotTime.m, "inc");
              updateAllSegments(
                appointmentDetails.slotTime.h,
                m,
                order,
                directHour,
              );
              setAppointmentDetails(function (appDet?: any) {
                return {
                  ...appDet,
                  slotTime: {
                    ...appDet.slotTime,
                    m,
                  },
                };
              });
            }}
            className="cursor-pointer sm:h-6 sm:w-6 h-5 w-5 rounded-lg text-gray-500"
          />
          <SquareArrowDown
            onClick={function () {
              const m = handleMinutes(appointmentDetails.slotTime.m, "dec");
              updateAllSegments(
                appointmentDetails.slotTime.h,
                m,
                order,
                directHour,
              );
              setAppointmentDetails(function (appDet?: any) {
                return {
                  ...appDet,
                  slotTime: {
                    ...appDet.slotTime,
                    m,
                  },
                };
              });
            }}
            className="cursor-pointer sm:h-6 sm:w-6 h-5 w-5 rounded-lg text-gray-500"
          />
        </div>
        <div
          className="time-section text-center text-gray-700 font-medium text-xs sm:text-sm"
          id={`minutes--${order}`}
        >
          <div className="time-group flex gap-1">
            <div
              className={`time-segment block font-black w-6 sm:w-8 text-2xl sm:text-3xl`}
            >
              <div className={`segment-display relative h-full`}>
                <div className="segment-display__top relative h-1/2 w-full overflow-hidden text-center leading-normal text-neutral-200 bg-blue-800"></div>
                <div className="segment-display__bottom relative h-1/2 w-full overflow-hidden text-center leading-none text-white bg-blue-500"></div>
                <div
                  className={`segment-overlay segment-overlay-slot absolute top-0 h-full perspective-normal w-6 sm:w-8`}
                >
                  <div className="segment-overlay__top absolute top-0 h-1/2 w-full origin-bottom overflow-hidden text-center leading-normal text-white bg-blue-800"></div>
                  <div className="segment-overlay__bottom absolute bottom-0 h-1/2 w-full origin-top overflow-hidden text-center leading-none text-neutral-200 bg-blue-500"></div>
                </div>
              </div>
            </div>
            <div
              className={`time-segment block font-black w-6 sm:w-8 text-2xl sm:text-3xl`}
            >
              <div className={`segment-display relative h-full`}>
                <div className="segment-display__top relative h-1/2 w-full overflow-hidden text-center leading-normal text-neutral-200 bg-blue-800"></div>
                <div className="segment-display__bottom relative h-1/2 w-full overflow-hidden text-center leading-none text-white bg-blue-500"></div>
                <div
                  className={`segment-overlay segment-overlay-slot absolute top-0 h-full perspective-normal w-6 sm:w-8`}
                >
                  <div className="segment-overlay__top absolute top-0 h-1/2 w-full origin-bottom overflow-hidden text-center leading-normal text-white bg-blue-800"></div>
                  <div className="segment-overlay__bottom absolute bottom-0 h-1/2 w-full origin-top overflow-hidden text-center leading-none text-neutral-200 bg-blue-500"></div>
                </div>
              </div>
            </div>
          </div>
          <p className="mb-0">Minute</p>
        </div>
      </div>
      <div className="flex gap-2 select-none">
        <div className="flex flex-col gap-1">
          <SquareArrowUp
            onClick={function () {
              setAppointmentDetails(function (appDet?: any) {
                return {
                  ...appDet,
                  slotTime: {
                    ...appDet.slotTime,
                    timeMode: appDet.slotTime.timeMode == "AM" ? "PM" : "AM",
                  },
                };
              });
            }}
            className="cursor-pointer h-5 w-5 rounded-lg text-gray-500"
          />
          <SquareArrowDown
            onClick={function () {
              setAppointmentDetails(function (appDet?: any) {
                return {
                  ...appDet,
                  slotTime: {
                    ...appDet.slotTime,
                    timeMode: appDet.slotTime.timeMode == "AM" ? "PM" : "AM",
                  },
                };
              });
            }}
            className="cursor-pointer h-5 w-5 rounded-lg text-gray-500"
          />
        </div>
        <span className="text-2xl sm:text-3xl text-blue-500 font-medium">
          {directMode || appointmentDetails.slotTime.timeMode}
        </span>
      </div>
    </div>
  );
}
