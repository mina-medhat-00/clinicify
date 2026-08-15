import { Avatar, Col, Empty, Rate, Row } from "antd";
const FeedbackContent = ({
  order,
  font,
  doctorPhoto,
  uimgUrl,
  dimgUrl,
  doctorName,
  userPhoto,
  username,
  feedback,
  rate,
  isMobile,
  bodyHandler,
  setShowFeedback,
  showFeedback,
  mobile,
}: any) => {
  return (
    <div
      key={order}
      className="grow flex items-center justify-center w-full feedback--container mb-4"
    >
      <div>
        <Row
          justify="space-between"
          align="middle"
          className="cursor-pointer rounded-2xl border-2 border-white bg-blue-400/90 hover:bg-blue-500/90"
          onClick={() => {
            if (showFeedback || mobile) {
              bodyHandler(order);
            }
            if (mobile) setShowFeedback(order + 1);
          }}
          style={{ fontSize: `${isMobile ? "12px" : "inherit"}` }}
        >
          <div className="p-2 flex items-center justify-between grow gap-2 bg-blue-600/80 shadow-md rounded-lg">
            <Col
              style={{ fontFamily: font }}
              className="flex gap-1 flex-wrap items-center justify-between"
            >
              <Avatar src={dimgUrl || doctorPhoto} size="large" />
              <span className="text-white font-medium text-lg sm:text-xl lg:text-xl">
                Dr. {doctorName?.slice(0, 12)}
              </span>
            </Col>
            <Col style={{ fontFamily: font }}>
              {<Rate disabled value={rate} />}
            </Col>
          </div>
          <div className="p-2 flex grow gap-2 bg-blue-200/30 rounded-lg">
            <Col
              className="flex flex-wrap items-center"
              style={{ fontFamily: font }}
            >
              <span className="text-gray-100 bg-blue-600/70 shadow-md rounded p-0.5 font-medium text-lg sm:text-xl lg:text-xl">
                by
              </span>
            </Col>
            <Col className="flex flex-wrap gap-1 items-center">
              <Avatar src={uimgUrl || userPhoto} size="large" />
              <span className="text-white font-medium text-lg sm:text-xl lg:text-xl">
                {username?.slice(0, 12)}
              </span>
            </Col>
          </div>
        </Row>
        <Col
          style={{
            fontFamily: font,
          }}
          className="box-content h-0 min-h-0 overflow-hidden rounded-lg bg-blue-500/80 p-0 transition-[height,padding] duration-[400ms] ease-in-out"
          id={`feedback--body--${order + 1}`}
        >
          <div id={`feedback--pragraph--${order + 1}`}>
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
};

export default FeedbackContent;
