import React from "react";
import { Row, Col, Statistic, Rate, Avatar, Skeleton } from "antd";
import { Link } from "react-router-dom";
import Feedbacks from "@/pages/feedbacks";
import Loader from "@/components/ui/loader";
import TitleHeader from "@/components/ui/title-header";
import Doctors from "@/pages/doctors";
import {
  PostsContextProvider,
  DoctorsContextProvider,
  FeedbackContextProvider,
} from "@/contexts";
import CountUpPkg from "react-countup";

const Countup =
  typeof CountUpPkg === "function" ? CountUpPkg : (CountUpPkg as any)?.default;
import { useHomeContext } from "@/contexts/home-context";
import Posts from "@/pages/posts";
import heroClinic from "@/assets/images/back2.jpg";
import Arrow from "@/components/ui/arrow";
import { AiOutlineSchedule } from "react-icons/ai";
import { BsFillChatSquareTextFill } from "react-icons/bs";
import { GiDoctorFace } from "react-icons/gi";
import { RiQuestionAnswerLine } from "react-icons/ri";
import { MdDashboard } from "react-icons/md";
import { ImProfile } from "react-icons/im";
import doctorIcon from "@/assets/images/doctor-icon.jpg";
import { FcStatistics } from "react-icons/fc";
import { VscFeedback } from "react-icons/vsc";
import TransitionContent from "@/components/ui/transition-content";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";

const HomePage = () => {
  const { socket, isMobile, lan, t } = useUtilsContext();
  const { isLoading: isUserLoading, userData: user } = useUserContext();
  const { homeData, isLoading } = useHomeContext();
  const globalStats = homeData;
  const HomeData = [
    {
      borderLine: "2",
      isLine: true,
      noLine: "no",
      title: "Total Doctors",
      value: globalStats?.totalDoctors,
    },
    {
      borderLine: "1",
      isLine: true,
      noLine: "sm",
      title: "Average Rating",
      value: globalStats?.avgRate || 0,
      prefix: (
        <Rate
          disabled
          allowHalf
          className="block mr-2"
          value={globalStats?.avgRate || 0}
        />
      ),
      suffix: <span className="text-gray-600 font-normal">/5</span>,
    },
    {
      borderLine: "1",
      isLine: true,
      noLine: "no",
      title: "Average Fees",
      value: globalStats?.avgFees,
    },
    {
      borderLine: "1",
      isLine: true,
      noLine: "sm",
      title: "Total Appointments",
      value: globalStats?.totalAppointments,
    },
    {
      borderLine: "1",
      isLine: true,
      noLine: "no",
      title: "Total Feedback",
      value: globalStats?.totalReviews,
    },
  ];
  return (
    <>
      <div
        className="text-center px-2"
        style={{
          backgroundImage: `url(${heroClinic})`,
          width: "100%",
          backgroundSize: "cover",
          minHeight: isMobile ? `calc(100vh - 52px)` : `100vh`,
        }}
      >
        {!isUserLoading ? (
          <TransitionContent id="home--hero">
            <div
              style={{
                direction: lan == "ar" ? "ltr" : "ltr",
              }}
              className="mb-8 sm:mx-6"
            >
              <h1
                className="mt-10 text-gray-100 shadow-lg py-6 sm:py-8 xl:py-10
          rounded-lg text-xl sm:text-4xl ml-auto mr-auto"
                style={{
                  fontFamily: "cursive",
                  backgroundImage:
                    "linear-gradient(to right, #194d84, #34659b, #407dbf)",
                }}
              >
                {t("Online Clinic")}
              </h1>
              {user && (
                <div className="flex gap-8 mt-2 justify-center px-2">
                  <div className="w-5/6">
                    <Arrow />
                    <div className="mt-2">
                      <Link
                        className="p-2 py-4 flex flex-col items-center gap-1 bg-blue-900 hover:text-white text-center hover:bg-blue-500 text-xs sm:text-base block rounded-lg bg-blue-400 font-medium text-gray-100"
                        to={
                          user?.user_type == "user"
                            ? `/profile/${user?.user_name}`
                            : user?.user_type == "admin"
                              ? `/admin`
                              : `/dashboard`
                        }
                      >
                        {user?.img_url ? (
                          <Avatar src={user.img_url} size="large" />
                        ) : user?.user_type == "user" ? (
                          <ImProfile className="mb-2 flex justify-center items-center w-full text-lg sm:text-2xl" />
                        ) : (
                          <MdDashboard className="mb-2 flex justify-center items-center w-full text-lg sm:text-2xl" />
                        )}
                        {t(
                          user?.user_type == "user"
                            ? `My Profile`
                            : user?.user_type == "admin"
                              ? `My Admin Dashboard`
                              : `My Doctor Dashboard`,
                        )}
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              {user && (
                <div className="flex gap-8 mt-2 justify-center px-2">
                  <div
                    className={`${
                      user?.user_type == "admin" ? "w-4/5" : "w-1/2"
                    }`}
                  >
                    <Arrow />
                    <div className="mt-2">
                      <Link
                        className="p-2 py-4 bg-blue-800 hover:text-white text-center hover:bg-blue-500 text-xs sm:text-base block rounded-lg bg-blue-400 font-medium text-gray-100"
                        to="/chat"
                      >
                        <BsFillChatSquareTextFill className="mb-2 flex justify-center items-center w-full text-lg sm:text-2xl" />
                        {t("Chatting")}
                      </Link>
                    </div>
                  </div>
                  {user.user_type !== "admin" && (
                    <div className="w-1/2">
                      <Arrow />
                      <div className="mt-2">
                        <Link
                          className="p-2 py-4 bg-blue-700 hover:text-white text-center hover:bg-blue-600 text-xs sm:text-base block rounded-lg bg-blue-400 font-medium text-gray-100"
                          to="/appointments"
                        >
                          <AiOutlineSchedule className="mb-2 flex justify-center items-center w-full text-lg sm:text-2xl" />
                          {t("Your Appointments")}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-8 mt-2 justify-center px-2">
                <div className="w-1/2">
                  <Arrow />
                  <div className="mt-2">
                    <Link
                      className="p-2 py-4 bg-blue-600 hover:text-white text-center hover:bg-blue-700 text-xs sm:text-base block rounded-lg bg-blue-400 font-medium text-gray-100"
                      to="/doctors"
                    >
                      <GiDoctorFace className="mb-2 flex justify-center items-center w-full text-lg sm:text-2xl" />
                      {t("Doctors")}
                    </Link>
                  </div>
                </div>
                <div className="w-1/2">
                  <Arrow />
                  <div className="mt-2">
                    <Link
                      className="p-2 hover:text-white text-center bg-blue-500 py-4 hover:bg-blue-800 text-xs sm:text-base block rounded-lg bg-blue-400 font-medium text-gray-100"
                      to="/posts"
                    >
                      <RiQuestionAnswerLine className="mb-2 flex justify-center items-center w-full text-lg sm:text-2xl" />
                      {t("Questions")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </TransitionContent>
        ) : (
          <div className="mt-10">
            <Skeleton.Button className="w-full" active size={90 as any} />
            <div className="flex w-full items-center gap-4 justify-center">
              <div className="grow">
                <Arrow />
                <Skeleton.Button className="w-full" active size={65 as any} />
              </div>
              <div className="grow">
                <Arrow />
                <Skeleton.Button className="w-full" active size={65 as any} />
              </div>
            </div>
          </div>
        )}
        <PostsContextProvider>
          <Posts socket={socket} home isMobile={isMobile} />
        </PostsContextProvider>
        {/*     
        <div className="relative rounded-br-lg rounded-bl-lg p-2">
        <img
        className="z-10 rounded-lg"
        src={heroClinic}
          style={{
            marginBlock: "auto",
              marginLeft: "auto",
              marginRight: "auto",
              height: isMobile ? "" : "500px",
            }}
          />
        </div> */}
        <TitleHeader
          wrapperBg={"no"}
          contentBg={"bg-blue-900/90"}
          title="Statistics"
          icon={
            <FcStatistics className="text-3xl sm:text-5xl xl:text-6xl m-auto" />
          }
        />
        {isLoading ? (
          <Loader />
        ) : (
          <TransitionContent key="statistics" speed="medium">
            <Row
              className="text-center bg-gray-200/30 shadow-md"
              style={{ marginBottom: "15px", marginInline: "10px" }}
            >
              {HomeData?.map(
                (
                  {
                    title,
                    value,
                    prefix,
                    suffix,
                    isLine,
                    noLine,
                    borderLine,
                  }: any,
                  i?: any,
                ) => {
                  const homeDetails = (
                    <>
                      <hr
                        className={`${
                          isLine
                            ? `w-full ${
                                noLine == "no" ? "" : `sm:hidden ${noLine}:w-0`
                              }`
                            : ""
                        } ${
                          borderLine == "2"
                            ? "border-gray-600"
                            : "border border-gray-300"
                        }`}
                        style={{
                          borderWidth: borderLine == "2" ? "1.5px" : "",
                        }}
                      />
                      <Col
                        className={`w-full py-2 sm:w-1/2 home--col--${
                          i + 1
                        } hover:shadow-md hover:bg-blue-100`}
                      >
                        {" "}
                        <Statistic
                          title={
                            <span className="text-gray-500 font-medium text-sm sm:text-lg">
                              {t(title)}
                            </span>
                          }
                          className="[&_div]:overflow-hidden [&_div]:text-ellipsis [&_div]:whitespace-nowrap [&_div_span]:block [&_div_span]:overflow-hidden [&_div_span]:text-ellipsis"
                          precision={2}
                          valueStyle={{
                            fontSize: isMobile ? "15px" : "20px",
                            fontWeight: 500,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                          value={value}
                          formatter={
                            title == "Average Rating"
                              ? undefined
                              : (val?: any) => (
                                  <Countup end={Number(val) || 0} />
                                )
                          }
                          suffix={suffix}
                          prefix={prefix}
                        />{" "}
                      </Col>
                    </>
                  );
                  return (
                    <React.Fragment key={title}>{homeDetails}</React.Fragment>
                  );
                },
              )}
            </Row>
          </TransitionContent>
        )}
        <div className="showmore--container">
          <TitleHeader
            wrapperBg={"no"}
            to="doctors"
            title="Doctors"
            img={doctorIcon}
          />
          {/* <div className="showmore--doctors">
          <Title
            className="text-xl sm:text-2xl lg:text-3xl text-gray-700"
            style={{ marginTop: "10px", marginBottom: "10px" }}
          >
          Our Doctors
          </Title>
          <Title
            className="text-sm sm:text-xl"
            style={{ marginTop: "10px", marginBottom: "10px" }}
          >
            <Link to="/doctors">Show More</Link>
          </Title>
        </div> */}
          <DoctorsContextProvider query={{ limit: 5 }}>
            <Doctors home />
          </DoctorsContextProvider>
          {/* <div className="showmore--reviews">
          <Title
          className="text-xl sm:text-2xl lg:text-3xl"
          style={{ marginTop: "20px", marginBottom: "10px" }}
          >
          Top 5 Feedbacks
          </Title>{" "}
          <Title
          className="text-sm sm:text-xl"
          style={{ marginTop: "20px", marginBottom: "10px" }}
          >
            <Link to="/feedbacks">Show More</Link>
          </Title>
        </div> */}
          <TitleHeader
            wrapperBg={"no"}
            to="feedbacks"
            title="Feedbacks"
            icon={
              <VscFeedback className="text-white text-3xl sm:text-5xl xl:text-6xl m-auto" />
            }
          />
          <FeedbackContextProvider
            contextQuery={{
              limit: 5,
            }}
          >
            <Feedbacks home />
          </FeedbackContextProvider>
        </div>
      </div>
    </>
  );
};
export default HomePage;
