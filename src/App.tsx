import { useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Cookies from "universal-cookie";
import AppointmentPayment from "@/components/booking/appointment-payment";
import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";
import Loader from "@/components/ui/loader";
import ServerError from "@/components/ui/server-error";
import {
  ChatContextProvider,
  DashboardContextProvider,
  DoctorsContextProvider,
  FeedbackContextProvider,
  HomeContextProvider,
  PostsContextProvider,
  ProfileContextProvider,
} from "@/contexts";
import AppointmentContextProvider from "@/contexts/appointment-context";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";
import AdminDashboard from "@/pages/admin-dashboard";
import Appointments from "@/pages/appointments";
import Chat from "@/pages/chat";
import DoctorDashboard from "@/pages/doctor-dashboard";
import Doctors from "@/pages/doctors";
import Feedbacks from "@/pages/feedbacks";
import HomePage from "@/pages/home-page";
import Login from "@/pages/login";
import OnlineMeeting from "@/pages/online-meeting";
import Posts from "@/pages/posts";
import ReportProblem from "@/pages/report-problem";
import Signup from "@/pages/signup";
import UserProfile from "@/pages/user-profile";

const cookies = new Cookies();
const handleRoute = (
  element?: any,
  permission?: any,
  isLoading?: any,
  isError?: any,
  ..._args: any[]
) =>
  permission ? (
    element
  ) : isLoading ? (
    <Loader />
  ) : isError ? (
    <Navigate to="/error" replace />
  ) : (
    <Navigate to="/forbbiden" replace />
  );
const App = () => {
  const [navActive, setNavActive] = useState(true);
  const DoctorRef = useRef<any>(null);
  const location = useLocation();
  const { userData, isLoading, isError } = useUserContext();
  const { lan } = useUtilsContext();
  const userAuth = userData;

  return (
    <div className={`overflow-x-hidden app flex flex-col min-h-screen`}>
      <div className="relative flex grow flex-row flex-nowrap justify-between max-[678px]:min-h-full max-[678px]:flex-col max-[678px]:justify-start">
        {navActive && <Navbar DoctorRef={DoctorRef} />}
        <div
          className="flex w-4/5 grow flex-col bg-[#bbc8d4] max-[678px]:w-full"
          style={{
            backgroundColor: "#f5f5f5",
            direction: lan == "ar" ? "rtl" : "ltr",
          }}
        >
          <Routes>
            <Route
              path="/"
              element={
                <HomeContextProvider>
                  <HomePage />
                </HomeContextProvider>
              }
            />
            <Route path="/join/meeting/:session" element={<OnlineMeeting />} />

            <Route
              path="/forbbiden"
              element={
                <ServerError
                  statusTitle={"403"}
                  status={403}
                  message="Cannot access Resource Right now"
                />
              }
            />
            <Route path="/error" element={<ServerError />} />
            <Route
              path="/doctors"
              element={
                <DoctorsContextProvider noFirstRender>
                  <Doctors ref={DoctorRef} />
                </DoctorsContextProvider>
              }
            />
            <Route
              path="/chat"
              element={handleRoute(
                <ChatContextProvider token={cookies.get("accessToken")}>
                  <Chat isChat={true} />
                </ChatContextProvider>,
                userAuth,
                isLoading,
                isError,
              )}
            />
            <Route
              path="/profile/:username"
              element={
                <ProfileContextProvider>
                  <UserProfile />
                </ProfileContextProvider>
              }
            />
            <Route
              path="/feedbacks"
              element={
                <FeedbackContextProvider>
                  <Feedbacks />
                </FeedbackContextProvider>
              }
            />
            <Route
              path="/posts"
              element={
                <PostsContextProvider>
                  <Posts />
                </PostsContextProvider>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/appointment/payment"
              element={<AppointmentPayment />}
            />
            <Route
              path="/appointments"
              element={handleRoute(
                <AppointmentContextProvider token={cookies.get("accessToken")}>
                  <Appointments />
                </AppointmentContextProvider>,
                userAuth && userAuth?.user_type !== "admin",
                isLoading,
                isError,
              )}
            />
            <Route
              path="/admin"
              element={handleRoute(
                <AdminDashboard />,
                userAuth?.user_type == "admin",
                isLoading,
                isError,
              )}
            />
            <Route
              path="/report/problem"
              element={handleRoute(
                <ReportProblem />,
                !!userAuth?.user_type,
                isLoading,
                isError,
              )}
            />
            <Route
              path="/dashboard"
              element={handleRoute(
                <DashboardContextProvider token={cookies.get("accessToken")}>
                  <DoctorDashboard setNavActive={setNavActive} />
                </DashboardContextProvider>,
                userAuth?.user_type == "doctor",
                isLoading,
                isError,
              )}
            />
          </Routes>
        </div>
      </div>
      {location.pathname == "/" && (
        <div className="bg-bg-bar text-center capitalize">
          <Footer />
        </div>
      )}
    </div>
  );
};

export default App;
