import { Col, Rate, Row, Statistic } from "@/components/ui";
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
import Loader from "@/components/ui/loader";
import TitleHeader from "@/components/ui/title-header";
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

export default function HomePage() {
  const { socket, isMobile } = useUtilsContext();
  const { userData: user } = useUserContext();
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
    <div className="w-full min-h-screen">
      <div className="mb-8">
        <h1 className="text-gray-100 text-center py-6 text-3xl bg-linear-to-r from-blue-900 via-blue-700 to-blue-600">
          Clinicify
        </h1>

        <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-center justify-center py-2">
          <Link
            className="w-4/5 sm:w-1/6 overflow-hidden flex flex-col items-center justify-center gap-2 bg-blue-800 text-white text-base font-bold p-4 rounded-lg hover:bg-blue-500"
            to={
              user?.user_type == "user"
                ? `/profile/${user?.user_name}`
                : user?.user_type == "admin"
                  ? `/admin`
                  : `/dashboard`
            }
          >
            {user?.user_type == "user" ? (
              <User className="size-6" />
            ) : (
              <LayoutDashboard className="size-6" />
            )}
            Dashboard
          </Link>

          <Link
            className="w-4/5 sm:w-1/6 overflow-hidden flex flex-col items-center justify-center gap-2 bg-blue-800 text-white text-base font-bold p-4 rounded-lg hover:bg-blue-500"
            to="/chat"
          >
            <MessageSquare className="size-6" />
            Chatting
          </Link>

          <Link
            className="w-4/5 sm:w-1/6 overflow-hidden flex flex-col items-center justify-center gap-2 bg-blue-800 text-white text-base font-bold p-4 rounded-lg hover:bg-blue-500"
            to="/appointments"
          >
            <Calendar className="size-6" />
            Appointments
          </Link>

          <Link
            className="w-4/5 sm:w-1/6 overflow-hidden flex flex-col items-center justify-center gap-2 bg-blue-800 text-white text-base font-bold p-4 rounded-lg hover:bg-blue-500"
            to="/doctors"
          >
            <Stethoscope className="size-6" />
            Doctors
          </Link>

          <Link
            className="w-4/5 sm:w-1/6 overflow-hidden flex flex-col items-center justify-center gap-2 bg-blue-800 text-white text-base font-bold p-4 rounded-lg hover:bg-blue-500"
            to="/posts"
          >
            <MessageCircleQuestion className="size-6" />
            Questions
          </Link>
        </div>
      </div>

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
        <Row className="text-center bg-gray-200/30 shadow-md mb-3.5 mx-2.5">
          {HomeData?.map(function (
            { title, value, prefix, suffix, isLine, noLine, borderLine }: any,
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
            return <React.Fragment key={title}>{homeDetails}</React.Fragment>;
          })}
        </Row>
      )}

      <div>
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
  );
}
