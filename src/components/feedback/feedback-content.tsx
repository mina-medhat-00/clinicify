import { Col, Empty, Rate, Row } from "@/components/ui/display";
import UserAvatar from "@/components/ui/user-avatar";
import type { Feedback } from "@/types/content";

export default function FeedbackContent({
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
}: Pick<
  Feedback,
  "uimgUrl" | "dimgUrl" | "doctorName" | "username" | "feedback" | "rate"
> & {
  order: number;
  isMobile?: boolean;
  // Toggles the review text of the card at order
  bodyHandler: (order: number) => void;
  setShowFeedback?: (shown: number) => void;
  showFeedback?: number;
  mobile?: boolean;
}) {
  return (
    <div
      key={order}
      className="grow flex items-center justify-center w-full feedback--container mb-4"
    >
      <div>
        <Row
          justify="space-between"
          align="middle"
          className={`cursor-pointer rounded-2xl border-2 border-white bg-blue-700 hover:bg-blue-800 ${
            isMobile ? "text-xs" : ""
          }`}
          onClick={function () {
            if (showFeedback || mobile) {
              bodyHandler(order);
            }
            if (mobile) setShowFeedback?.(order + 1);
          }}
        >
          <div className="flex grow items-center justify-between gap-2 rounded-lg bg-blue-900/60 p-2 shadow-md">
            <Col className="flex gap-1 flex-wrap items-center justify-between">
              <UserAvatar src={dimgUrl} userType="doctor" size="large" />
              <span className="text-white font-medium text-lg sm:text-xl lg:text-xl">
                Dr. {doctorName.slice(0, 12)}
              </span>
            </Col>
            <Col>
              <Rate disabled value={rate} />
            </Col>
          </div>
          <div className="flex grow gap-2 rounded-lg p-2">
            <Col className="flex flex-wrap items-center">
              <span className="p-0.5 font-medium text-blue-100 text-lg sm:text-xl lg:text-xl">
                by
              </span>
            </Col>
            <Col className="flex flex-wrap gap-1 items-center">
              <UserAvatar src={uimgUrl} userType="user" size="large" />
              <span className="text-white font-medium text-lg sm:text-xl lg:text-xl">
                {username.slice(0, 12)}
              </span>
            </Col>
          </div>
        </Row>
        <Col
          id={`feedback--body--${String(order + 1)}`}
          className="box-content h-0 min-h-0 overflow-hidden rounded-lg bg-blue-900 p-0 transition-all duration-500 ease-in-out"
        >
          <div id={`feedback--paragraph--${String(order + 1)}`}>
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
