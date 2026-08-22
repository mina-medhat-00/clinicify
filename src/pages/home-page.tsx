import { Col, Rate, Row, Skeleton, Statistic } from "@/components/ui/kit";
import React from "react";
import CountUpPkg from "react-countup";
import { Link } from "react-router-dom";
import {
  Calendar,
  ChartColumn,
  LayoutDashboard,
  MessageCircleQuestion,
  MessageSquare,
  Star,
  Stethoscope,
  User,
} from "lucide-react";
import heroClinic from "@/assets/images/background.jpg";
import Arrow from "@/components/ui/arrow";
import Loader from "@/components/ui/loader";
import TitleHeader from "@/components/ui/title-header";
import TransitionContent from "@/components/ui/transition-content";
import UserAvatar from "@/components/ui/user-avatar";
import {
  DoctorsContextProvider,
  FeedbackContextProvider,
  PostsContextProvider,
} from "@/contexts";
import { useHomeContext } from "@/contexts/home-context";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";
import Doctors from "@/pages/doctors";
import Feedbacks from "@/pages/feedbacks";
import Posts from "@/pages/posts";

const Countup =
  typeof CountUpPkg === "function" ? CountUpPkg : (CountUpPkg as any)?.default;

function HomePage() {
  const { socket, isMobile } = useUtilsContext();
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
        className="text-center px-2 w-full bg-cover min-h-screen"
        style={{
          backgroundImage: `url(${heroClinic})`,
        }}
      >
        {!isUserLoading ? (
          <TransitionContent id="home--hero">
            <div className="mb-8 sm:mx-6">
              <h1
                className="mt-10 text-gray-100 shadow-lg py-6 sm:py-8 xl:py-10
          rounded-lg text-xl sm:text-4xl ml-auto mr-auto bg-linear-to-r from-blue-900 via-blue-700 to-blue-600"
              >
                Clinicify
              </h1>
              {user && (
                <div className="flex gap-8 mt-2 justify-center px-2">
                  <div className="w-5/6">
                    <Arrow />
                    <div className="mt-2">
                      <Link
                        className="p-2 py-4 flex flex-col items-center gap-1 bg-blue-900 hover:text-white text-center hover:bg-blue-500 text-xs sm:text-base rounded-lg font-medium text-gray-100"
                        to={
                          user?.user_type == "user"
                            ? `/profile/${user?.user_name}`
                            : user?.user_type == "admin"
                              ? `/admin`
                              : `/dashboard`
                        }
                      >
                        {user?.img_url ? (
                          <UserAvatar
                            src={user.img_url}
                            userType={user?.user_type}
                          />
                        ) : user?.user_type == "user" ? (
                          <User className="mb-2 flex justify-center items-center w-full size-5 sm:size-6" />
                        ) : (
                          <LayoutDashboard className="mb-2 flex justify-center items-center w-full size-5 sm:size-6" />
                        )}
                        {user?.user_type == "user"
                          ? "My Profile"
                          : user?.user_type == "admin"
                            ? "My Admin Dashboard"
                            : "My Doctor Dashboard"}
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
                        className="p-2 py-4 bg-blue-800 hover:text-white text-center hover:bg-blue-500 text-xs sm:text-base block rounded-lg font-medium text-gray-100"
                        to="/chat"
                      >
                        <MessageSquare className="mb-2 flex justify-center items-center w-full size-5 sm:size-6" />
                        {"Chatting"}
                      </Link>
                    </div>
                  </div>
                  {user.user_type !== "admin" && (
                    <div className="w-1/2">
                      <Arrow />
                      <div className="mt-2">
                        <Link
                          className="p-2 py-4 bg-blue-700 hover:text-white text-center hover:bg-blue-600 text-xs sm:text-base block rounded-lg font-medium text-gray-100"
                          to="/appointments"
                        >
                          <Calendar className="mb-2 flex justify-center items-center w-full size-5 sm:size-6" />
                          {"Your Appointments"}
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
                      className="p-2 py-4 bg-blue-600 hover:text-white text-center hover:bg-blue-700 text-xs sm:text-base block rounded-lg font-medium text-gray-100"
                      to="/doctors"
                    >
                      <Stethoscope className="mb-2 flex justify-center items-center w-full size-5 sm:size-6" />
                      {"Doctors"}
                    </Link>
                  </div>
                </div>
                <div className="w-1/2">
                  <Arrow />
                  <div className="mt-2">
                    <Link
                      className="p-2 hover:text-white text-center bg-blue-500 py-4 hover:bg-blue-800 text-xs sm:text-base block rounded-lg font-medium text-gray-100"
                      to="/posts"
                    >
                      <MessageCircleQuestion className="mb-2 flex justify-center items-center w-full size-5 sm:size-6" />
                      {"Questions"}
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
        <TitleHeader
          wrapperBg={"no"}
          contentBg={"bg-blue-900/90"}
          title="Statistics"
          icon={
            <ChartColumn className="text-3xl sm:text-5xl xl:text-6xl m-auto" />
          }
        />
        {isLoading ? (
          <Loader />
        ) : (
          <TransitionContent key="statistics" speed="medium">
            <Row className="text-center bg-gray-200/30 shadow-md mb-3.5 mx-2.5">
              {HomeData?.map(function (
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
              ) {
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
                          ? "border-gray-600 border-[1.5px]"
                          : "border border-gray-300"
                      }`}
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
                            {title}
                          </span>
                        }
                        className="[&_div]:overflow-hidden [&_div]:text-ellipsis [&_div]:whitespace-nowrap [&_div_span]:block [&_div_span]:overflow-hidden [&_div_span]:text-ellipsis [&_.ant-statistic-content]:flex [&_.ant-statistic-content]:items-center [&_.ant-statistic-content]:justify-center [&_.ant-statistic-content]:font-medium [&_.ant-statistic-content]:text-sm md:[&_.ant-statistic-content]:text-xl"
                        precision={2}
                        value={value}
                        formatter={
                          title == "Average Rating"
                            ? undefined
                            : function (val?: any) {
                                return <Countup end={Number(val) || 0} />;
                              }
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
              })}
            </Row>
          </TransitionContent>
        )}
        <div className="showmore--container">
          <TitleHeader
            wrapperBg={"no"}
            to="doctors"
            title="Doctors"
            icon={
              <Stethoscope className="text-white size-12 sm:size-16 xl:size-20 m-auto" />
            }
          />
          <DoctorsContextProvider query={{ limit: 5 }}>
            <Doctors home />
          </DoctorsContextProvider>
          <TitleHeader
            wrapperBg={"no"}
            to="feedbacks"
            title="Feedbacks"
            icon={
              <Star className="text-white text-3xl sm:text-5xl xl:text-6xl m-auto" />
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
}
export default HomePage;
