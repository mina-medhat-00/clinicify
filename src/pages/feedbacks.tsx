import { Carousel, Col, Empty } from "@/components/ui";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import FeedbackContent from "@/components/feedback/feedback-content";
import Loader from "@/components/ui/loader";
import PopUp from "@/components/ui/pop-up";
import ServerError from "@/components/ui/server-error";
import TitleHeader from "@/components/ui/title-header";
import { useFeedbackContext } from "@/contexts/feedback-context";

export default function Feedbacks({
  home,
  noDirectFetch,
  username,
  fetchFeedback,
}: any) {
  const { feedbackData, isLoading, isError, fetchFeedbackData } =
    useFeedbackContext();
  const isMobile = useMediaQuery({
    query: "(max-width:778px)",
  });
  const [showFeedback, setShowFeedback] = useState(false);
  const [showPopUp, setShowPopUp] = useState(false);
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
        fetchFeedbackData(
          {
            username,
          },
          fetchFeedback == false || fetchFeedback == true,
        );
    },
    [fetchFeedback, fetchFeedbackData, noDirectFetch, username],
  );
  if (isLoading) return <Loader />;
  async function bodyHandler(order?: any) {
    const bodyElement = document.getElementById(`feedback--body--${order + 1}`);
    const paragraphElement = document.getElementById(
      `feedback--paragraph--${order + 1}`,
    );
    bodyElement.style.overflow = "hidden";
    setTimeout(function () {
      bodyElement.style.overflow = "auto";
    }, 400);
    if (bodyElement.offsetHeight !== 0) {
      bodyElement.style.height = "0px";
      bodyElement.style.padding = "0px";
    } else {
      bodyElement.style.height = `${paragraphElement.offsetHeight}px`;
      bodyElement.style.padding = "10px";
    }
  }
  return (
    <>
      {home && (
        <TitleHeader
          contClass="flex gap-2 items-center justify-center flex-row-reverse"
          wrapperBg={"no"}
          contentBg={"bg-blue-900/90"}
          title="Feedbacks"
          icon={<Star className="text-white w-16 h-16" />}
        />
      )}
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
            {feedbackData?.length > 0 ? (
              feedbackData?.map(function (
                { feedback, rate, doctorName, username, uimgUrl, dimgUrl }: any,
                order?: any,
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
              <ServerError errorTitle={"Feedbacks"} />
            ) : (
              <Empty
                className="flex items-center flex-col w-full mb-2"
                description={
                  <span className={`text-gray-500 font-medium`}>
                    There are no feedbacks
                  </span>
                }
              ></Empty>
            )}
          </Carousel>
        ) : feedbackData?.length > 0 ? (
          <div className="flex flex-wrap justify-evenly items-start gap-2 px-3">
            {feedbackData?.map(function (
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
                  key={`${feedback_from}${feedback_to}`}
                  className="sm:w-1/3 grow 2xl:w-1/4"
                >
                  {showPopUp == order + 1 ? (
                    <PopUp
                      customWidth={
                        "min-h-3/4 overflow-hidden w-5/6 lg:w-3/4 xl:w-1/2"
                      }
                      show={showFeedback}
                      mt={20}
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
                        showFeedback={showFeedback}
                      />
                    </PopUp>
                  ) : (
                    <FeedbackContent
                      showFeedback={showFeedback}
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
          <ServerError errorTitle={"Feedbacks"} />
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
