import { useEffect } from "react";

function CountdownTimer({ targetDate, order }: any) {
  useEffect(
    function () {
      function getTimeSegmentElements(segmentElement?: any, ..._args: any[]) {
        const segmentDisplay = segmentElement.querySelector(
          `.segment-display--${order}`,
        );
        const segmentDisplayTop = segmentDisplay.querySelector(
          `.segment-display__top`,
        );
        const segmentDisplayBottom = segmentDisplay.querySelector(
          `.segment-display__bottom`,
        );

        const segmentOverlay = segmentDisplay.querySelector(
          `.segment-overlay--${order}`,
        );
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
        ..._args: any[]
      ) {
        displayElement.textContent = value;
        overlayElement.textContent = value;
      }

      function updateTimeSegment(
        segmentElement?: any,
        timeValue?: any,
        ..._args: any[]
      ) {
        const segmentElements = getTimeSegmentElements(segmentElement);
        if (
          parseInt(segmentElements.segmentDisplayTop.textContent, 10) ===
          timeValue
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

      function updateTimeSection(
        sectionID?: any,
        timeValue?: any,
        ..._args: any[]
      ) {
        const firstNumber = Math.floor(timeValue / 10) || 0;
        const secondNumber = timeValue % 10 || 0;
        const sectionElement = document.getElementById(sectionID);
        const timeSegments = sectionElement.querySelectorAll(
          `.time-segment--${order}`,
        );
        updateTimeSegment(timeSegments[0], firstNumber);
        updateTimeSegment(timeSegments[1], secondNumber);
      }

      function getTimeRemaining(targetDateTime?: any, ..._args: any[]) {
        const nowTime = Date.now();
        const complete = nowTime >= targetDateTime;

        if (complete) {
          return {
            complete,
            seconds: 0,
            minutes: 0,
            hours: 0,
          };
        }

        const secondsRemaining = Math.floor((targetDateTime - nowTime) / 1000);
        const hours = Math.floor(secondsRemaining / 60 / 60);
        const minutes = Math.floor(secondsRemaining / 60) - hours * 60;
        const seconds = secondsRemaining % 60;

        return {
          complete,
          seconds,
          minutes,
          hours,
        };
      }

      function updateAllSegments() {
        const timeRemainingBits = getTimeRemaining(
          new Date(targetDate).getTime(),
        );
        updateTimeSection(`seconds--${order}`, timeRemainingBits.seconds);
        updateTimeSection(`minutes--${order}`, timeRemainingBits.minutes);
        updateTimeSection(`hours--${order}`, timeRemainingBits.hours);
        return timeRemainingBits.complete;
      }

      const countdownTimer = setInterval(function () {
        const isComplete = updateAllSegments();
        if (isComplete) {
          clearInterval(countdownTimer);
        }
      }, 1000);

      updateAllSegments();
      return function () {
        clearInterval(countdownTimer);
      };
    },
    [order, targetDate],
  );
  return (
    <div className="countdown w-full justify-center flex-wrap flex gap-2 sm:gap-4 pt-1">
      <div
        className="time-section text-center text-gray-100 text-xs sm:text-sm"
        id={`hours--${order}`}
      >
        <div className="time-group flex gap-1">
          <div
            className={`time-segment time-segment--${order} block font-black w-6 sm:w-10 text-2xl sm:text-3xl`}
          >
            <div
              className={`segment-display segment-display--${order} relative h-full`}
            >
              <div className="segment-display__top relative h-1/2 w-full overflow-hidden text-center leading-normal text-neutral-200 bg-gray-800"></div>
              <div className="segment-display__bottom relative h-1/2 w-full overflow-hidden text-center leading-none text-white bg-gray-600"></div>
              <div
                className={`segment-overlay segment-overlay--${order} absolute top-0 h-full perspective-normal w-6 sm:w-10`}
              >
                <div className="segment-overlay__top absolute top-0 h-1/2 w-full origin-bottom overflow-hidden text-center leading-normal text-white bg-gray-800"></div>
                <div className="segment-overlay__bottom absolute bottom-0 h-1/2 w-full origin-top overflow-hidden text-center leading-none text-neutral-200 bg-gray-600">
                  {" "}
                </div>
              </div>
            </div>
          </div>
          <div
            className={`time-segment time-segment--${order} block font-black w-6 sm:w-10 text-2xl sm:text-3xl`}
          >
            <div
              className={`segment-display segment-display--${order} relative h-full`}
            >
              <div className="segment-display__top relative h-1/2 w-full overflow-hidden text-center leading-normal text-neutral-200 bg-gray-800"></div>
              <div className="segment-display__bottom relative h-1/2 w-full overflow-hidden text-center leading-none text-white bg-gray-600"></div>
              <div
                className={`segment-overlay segment-overlay--${order} absolute top-0 h-full perspective-normal w-6 sm:w-10`}
              >
                <div className="segment-overlay__top absolute top-0 h-1/2 w-full origin-bottom overflow-hidden text-center leading-normal text-white bg-gray-800"></div>
                <div className="segment-overlay__bottom absolute bottom-0 h-1/2 w-full origin-top overflow-hidden text-center leading-none text-neutral-200 bg-gray-600"></div>
              </div>
            </div>
          </div>
        </div>
        <p className="mb-0">Hours</p>
      </div>

      <div
        className="time-section text-center text-gray-100 text-xs sm:text-sm"
        id={`minutes--${order}`}
      >
        <div className="time-group flex gap-1">
          <div
            className={`time-segment time-segment--${order} block font-black w-6 sm:w-10 text-2xl sm:text-3xl`}
          >
            <div
              className={`segment-display segment-display--${order} relative h-full`}
            >
              <div className="segment-display__top relative h-1/2 w-full overflow-hidden text-center leading-normal text-neutral-200 bg-gray-800"></div>
              <div className="segment-display__bottom relative h-1/2 w-full overflow-hidden text-center leading-none text-white bg-gray-600"></div>
              <div
                className={`segment-overlay segment-overlay--${order} absolute top-0 h-full perspective-normal w-6 sm:w-10`}
              >
                <div className="segment-overlay__top absolute top-0 h-1/2 w-full origin-bottom overflow-hidden text-center leading-normal text-white bg-gray-800"></div>
                <div className="segment-overlay__bottom absolute bottom-0 h-1/2 w-full origin-top overflow-hidden text-center leading-none text-neutral-200 bg-gray-600"></div>
              </div>
            </div>
          </div>
          <div
            className={`time-segment time-segment--${order} block font-black w-6 sm:w-10 text-2xl sm:text-3xl`}
          >
            <div
              className={`segment-display segment-display--${order} relative h-full`}
            >
              <div className="segment-display__top relative h-1/2 w-full overflow-hidden text-center leading-normal text-neutral-200 bg-gray-800"></div>
              <div className="segment-display__bottom relative h-1/2 w-full overflow-hidden text-center leading-none text-white bg-gray-600"></div>
              <div
                className={`segment-overlay segment-overlay--${order} absolute top-0 h-full perspective-normal w-6 sm:w-10`}
              >
                <div className="segment-overlay__top absolute top-0 h-1/2 w-full origin-bottom overflow-hidden text-center leading-normal text-white bg-gray-800"></div>
                <div className="segment-overlay__bottom absolute bottom-0 h-1/2 w-full origin-top overflow-hidden text-center leading-none text-neutral-200 bg-gray-600"></div>
              </div>
            </div>
          </div>
        </div>
        <p className="mb-0">Minutes</p>
      </div>

      <div
        className="time-section text-center text-gray-100 text-xs sm:text-sm"
        id={`seconds--${order}`}
      >
        <div className="time-group flex gap-1">
          <div
            className={`time-segment time-segment--${order} block font-black w-6 sm:w-10 text-2xl sm:text-3xl`}
          >
            <div
              className={`segment-display segment-display--${order} relative h-full`}
            >
              <div className="segment-display__top relative h-1/2 w-full overflow-hidden text-center leading-normal text-neutral-200 bg-gray-800"></div>
              <div className="segment-display__bottom relative h-1/2 w-full overflow-hidden text-center leading-none text-white bg-gray-600"></div>
              <div
                className={`segment-overlay segment-overlay--${order} absolute top-0 h-full perspective-normal w-6 sm:w-10`}
              >
                <div className="segment-overlay__top absolute top-0 h-1/2 w-full origin-bottom overflow-hidden text-center leading-normal text-white bg-gray-800"></div>
                <div className="segment-overlay__bottom absolute bottom-0 h-1/2 w-full origin-top overflow-hidden text-center leading-none text-neutral-200 bg-gray-600"></div>
              </div>
            </div>
          </div>
          <div
            className={`time-segment time-segment--${order} block font-black w-6 sm:w-10 text-2xl sm:text-3xl`}
          >
            <div
              className={`segment-display segment-display--${order} relative h-full`}
            >
              <div className="segment-display__top relative h-1/2 w-full overflow-hidden text-center leading-normal text-neutral-200 bg-gray-800"></div>
              <div className="segment-display__bottom relative h-1/2 w-full overflow-hidden text-center leading-none text-white bg-gray-600"></div>
              <div
                className={`segment-overlay segment-overlay--${order} absolute top-0 h-full perspective-normal w-6 sm:w-10`}
              >
                <div className="segment-overlay__top absolute top-0 h-1/2 w-full origin-bottom overflow-hidden text-center leading-normal text-white bg-gray-800"></div>
                <div className="segment-overlay__bottom absolute bottom-0 h-1/2 w-full origin-top overflow-hidden text-center leading-none text-neutral-200 bg-gray-600"></div>
              </div>
            </div>
          </div>
        </div>
        <p className="mb-0">Seconds</p>
      </div>
    </div>
  );
}

export default CountdownTimer;
