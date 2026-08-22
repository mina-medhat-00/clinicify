import { Col, Empty, Rate, Row } from "@/components/ui/kit";
import UserAvatar from "@/components/ui/user-avatar";

function FeedbackContent({
  order,
  uimgUrl,
  dimgUrl,
  doctorName,
  username,
  feedback,
  rate,
  isMobile,
  bodyHandler,
  setShowFeedback,
  showFeedback,
  mobile,
}: any) {
  return (
    <div
      key={order}
      className="grow flex items-center justify-center w-full feedback--container mb-4"
    >
      <div>
        <Row
          justify="space-between"
          align="middle"
          className={`cursor-pointer rounded-2xl border-2 border-white bg-blue-400/90 hover:bg-blue-500/90 ${
            isMobile ? "text-xs" : ""
          }`}
          onClick={function () {
            if (showFeedback || mobile) {
              bodyHandler(order);
            }
            if (mobile) setShowFeedback(order + 1);
          }}
        >
          <div className="p-2 flex items-center justify-between grow gap-2 bg-blue-600/80 shadow-md rounded-lg">
            <Col className="flex gap-1 flex-wrap items-center justify-between">
              <UserAvatar src={dimgUrl} userType="doctor" size="large" />
              <span className="text-white font-medium text-lg sm:text-xl lg:text-xl">
                Dr. {doctorName?.slice(0, 12)}
              </span>
            </Col>
            <Col>{<Rate disabled value={rate} />}</Col>
          </div>
          <div className="p-2 flex grow gap-2 bg-blue-200/30 rounded-lg">
            <Col className="flex flex-wrap items-center">
              <span className="text-gray-100 bg-blue-600/70 shadow-md rounded p-0.5 font-medium text-lg sm:text-xl lg:text-xl">
                by
              </span>
            </Col>
            <Col className="flex flex-wrap gap-1 items-center">
              <UserAvatar src={uimgUrl} userType="user" size="large" />
              <span className="text-white font-medium text-lg sm:text-xl lg:text-xl">
                {username?.slice(0, 12)}
              </span>
            </Col>
          </div>
        </Row>
        <Col
          id={`feedback--body--${order + 1}`}
          className="box-content h-0 min-h-0 overflow-hidden rounded-lg bg-blue-500/80 p-0 transition-all duration-500 ease-in-out"
        >
          <div id={`feedback--paragraph--${order + 1}`}>
            <span className="text-white break-all font-medium">
              {feedback || (
                <Empty
                  className="flex items-center flex-col w-full"
                  description={
                    <span className="text-gray-100 font-medium">
                      there's no feedback provided
                    </span>
                  }
                ></Empty>
              )}
            </span>
          </div>
        </Col>
      </div>
    </div>
  );
}

export default FeedbackContent;
