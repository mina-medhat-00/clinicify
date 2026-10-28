import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import FeedbackContent from "@/components/feedback/feedback-content";
import { Carousel } from "@/components/ui/carousel";
import { Col, Empty } from "@/components/ui/display";
import Loader from "@/components/ui/loader";
import PopUp from "@/components/ui/pop-up";
import ServerError from "@/components/ui/server-error";
import { useFeedbackContext } from "@/contexts/feedback-context";

// Opens or closes a review's text by animating its height.
function bodyHandler(order: number) {
  const bodyElement = document.getElementById(
    `feedback--body--${String(order + 1)}`,
  );
  const paragraphElement = document.getElementById(
    `feedback--paragraph--${String(order + 1)}`,
  );
  if (!bodyElement || !paragraphElement) return;
  bodyElement.style.overflow = "hidden";
  setTimeout(function () {
    bodyElement.style.overflow = "auto";
  }, 400);
  if (bodyElement.offsetHeight !== 0) {
    bodyElement.style.height = "0px";
    bodyElement.style.padding = "0px";
  } else {
    bodyElement.style.height = `${String(paragraphElement.offsetHeight)}px`;
    bodyElement.style.padding = "10px";
  }
}

export default function Feedbacks({
  home,
  noDirectFetch,
  username,
  fetchFeedback,
}: {
  home?: boolean;
  // The page loads the list itself (for one doctor's profile).
  noDirectFetch?: boolean;
  username?: string;
  // Changes after a new review, to reload the list in the background.
  fetchFeedback?: number | null;
}) {
  const { feedbackData, isLoading, isError, fetchFeedbackData } =
    useFeedbackContext();
  const isMobile = useMediaQuery({
    query: "(max-width:778px)",
  });
  // The open review's position + 1, or null when none is open.
  const [showFeedback, setShowFeedback] = useState<number | null>(null);
  const [showPopUp, setShowPopUp] = useState<number | null>(null);
  if (showFeedback && showPopUp !== showFeedback) setShowPopUp(showFeedback);
  useEffect(
    function () {
      if (showFeedback) return;
      const timeId = setTimeout(function () {
        setShowPopUp(null);
      }, 400);
      return function () {
        clearTimeout(timeId);
      };
    },
    [showFeedback],
  );
  useEffect(
    function () {
      if (noDirectFetch)
        // After a new feedback (fetchFeedback changed), refresh without a spinner.
        void fetchFeedbackData(
          { username },
          { silent: fetchFeedback !== null && fetchFeedback !== undefined },
        );
    },
    [fetchFeedback, fetchFeedbackData, noDirectFetch, username],
  );
  if (isLoading) return <Loader />;
  const feedbacks = feedbackData ?? [];
  return (
    <>
      <Col
        className={`${
          home && username ? "bg-blue-600/60" : ""
        } py-2 feedbacks--container rounded-lg mb-5 mx-2`}
      >
        {home && isMobile ? (
          <Carousel
            autoplay
            autoplaySpeed={6000}
            dotPlacement="bottom"
            className="bg-gray-200/60 py-2 rounded-3xl"
            dots={{
              className: "bg-blue-500 p-1 rounded-md",
            }}
          >
            {feedbacks.length > 0 ? (
              feedbacks.map(function (
                { feedback, rate, doctorName, username, uimgUrl, dimgUrl },
                order,
              ) {
                return (
                  <div className="mb-16" key={order}>
                    <FeedbackContent
                      order={order}
                      rate={rate}
                      bodyHandler={bodyHandler}
                      isMobile={isMobile}
                      setShowFeedback={setShowFeedback}
                      feedback={feedback}
                      username={username}
                      doctorName={doctorName}
                      uimgUrl={uimgUrl}
                      dimgUrl={dimgUrl}
                      mobile
                    />
                  </div>
                );
              })
            ) : isError ? (
              <ServerError errorTitle="Feedbacks" />
            ) : (
              <Empty
                className="flex items-center flex-col w-full mb-2"
                description={
                  <span className="text-gray-500 font-medium">
                    There are no feedbacks
                  </span>
                }
              ></Empty>
            )}
          </Carousel>
        ) : feedbacks.length > 0 ? (
          <div className="flex flex-wrap justify-evenly items-start gap-2 px-3">
            {feedbacks.map(function (
              {
                feedback_from,
                feedback_to,
                feedback,
                rate,
                doctorName,
                username,
                uimgUrl,
                dimgUrl,
              },
              order,
            ) {
              return (
                <div
                  key={`${String(feedback_from)}-${String(feedback_to)}`}
                  className="sm:w-1/3 grow 2xl:w-1/4"
                >
                  {showPopUp === order + 1 ? (
                    <PopUp
                      customWidth="min-h-3/4 overflow-hidden w-5/6 lg:w-3/4 xl:w-1/2"
                      show={showFeedback}
                      mt="20px"
                      handleClose={function () {
                        setShowFeedback(null);
                      }}
                    >
                      <FeedbackContent
                        order={order}
                        rate={rate}
                        bodyHandler={bodyHandler}
                        isMobile={isMobile}
                        setShowFeedback={setShowFeedback}
                        feedback={feedback}
                        username={username}
                        doctorName={doctorName}
                        uimgUrl={uimgUrl}
                        dimgUrl={dimgUrl}
                        showFeedback={showFeedback ?? undefined}
                      />
                    </PopUp>
                  ) : (
                    <FeedbackContent
                      showFeedback={showFeedback ?? undefined}
                      order={order}
                      rate={rate}
                      bodyHandler={bodyHandler}
                      isMobile={isMobile}
                      setShowFeedback={setShowFeedback}
                      feedback={feedback}
                      username={username}
                      doctorName={doctorName}
                      uimgUrl={uimgUrl}
                      dimgUrl={dimgUrl}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ) : isError ? (
          <ServerError errorTitle="Feedbacks" />
        ) : (
          <Empty
            className={`${
              home && !username ? "mt-20" : ""
            } flex items-center flex-col w-full mb-2`}
            description={
              <span
                className={`${
                  home
                    ? username
                      ? "text-white"
                      : "text-gray-500"
                    : "text-white bg-blue-600/60 p-1 rounded"
                } font-medium`}
              >
                There are no feedbacks
              </span>
            }
          ></Empty>
        )}
      </Col>
    </>
  );
}
