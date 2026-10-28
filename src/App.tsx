import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";
import Loader from "@/components/ui/loader";
import ServerError from "@/components/ui/server-error";
import ChatContextProvider from "@/contexts/chat-context";
import DashboardContextProvider from "@/contexts/dashboard-context";
import DoctorsContextProvider from "@/contexts/doctors-context";
import FeedbackContextProvider from "@/contexts/feedback-context";
import HomeContextProvider from "@/contexts/home-context";
import PostsContextProvider from "@/contexts/posts-context";
import ProfileContextProvider from "@/contexts/profile-context";
import AppointmentContextProvider from "@/contexts/appointment-context";
import { useUserContext } from "@/contexts/user-context";
import AdminDashboard from "@/pages/admin-dashboard";
import Appointments from "@/pages/appointments";
import Chat from "@/pages/chat";
import DoctorDashboard from "@/pages/doctor-dashboard";
import Doctors, { type DoctorsHandle } from "@/pages/doctors";
import Feedbacks from "@/pages/feedbacks";
import HomePage from "@/pages/home-page";
import Login from "@/pages/login";
import OnlineMeeting from "@/pages/online-meeting";
import Posts from "@/pages/posts";
import ReportProblem from "@/pages/report-problem";
import Signup from "@/pages/signup";
import UserProfile from "@/pages/user-profile";

function handleRoute(
  element: ReactNode,
  permission: boolean,
  isLoading: boolean,
  isError: boolean,
  isLoggedIn: boolean,
  pathname: string,
) {
  if (permission) return element;
  if (isLoading) return <Loader />;
  if (isError) return <Navigate to="/error" replace />;
  // Logged-out visitors should sign in, then come back here.
  if (!isLoggedIn)
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(pathname)}`}
        replace
      />
    );
  return <Navigate to="/forbidden" replace />;
}

export default function App() {
  const [navActive, setNavActive] = useState(true);
  const DoctorRef = useRef<DoctorsHandle>(null);
  const location = useLocation();
  const { userData, isLoading, isError } = useUserContext();
  const userAuth = userData;
  const userType = userAuth?.user_type;

  return (
    <div className="overflow-x-hidden app flex flex-col min-h-screen">
      <div className="relative flex grow flex-row flex-nowrap justify-between max-md:min-h-full max-md:flex-col max-md:justify-start">
        {navActive && <Navbar DoctorRef={DoctorRef} />}
        <div className="flex w-4/5 grow flex-col bg-neutral-100 max-md:w-full">
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
              path="/forbidden"
              element={
                <ServerError
                  status={403}
                  message="You don't have access to this page"
                  extra
                />
              }
            />
            <Route path="/error" element={<ServerError extra />} />
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
                <ChatContextProvider>
                  <Chat />
                </ChatContextProvider>,
                Boolean(userAuth),
                isLoading,
                isError,
                Boolean(userAuth),
                location.pathname,
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
              path="/appointments"
              element={handleRoute(
                <AppointmentContextProvider>
                  <Appointments />
                </AppointmentContextProvider>,
                Boolean(userType) && userType !== "admin",
                isLoading,
                isError,
                Boolean(userAuth),
                location.pathname,
              )}
            />
            <Route
              path="/admin"
              element={handleRoute(
                <AdminDashboard />,
                userType === "admin",
                isLoading,
                isError,
                Boolean(userAuth),
                location.pathname,
              )}
            />
            <Route
              path="/report/problem"
              element={handleRoute(
                <ReportProblem />,
                Boolean(userType),
                isLoading,
                isError,
                Boolean(userAuth),
                location.pathname,
              )}
            />
            <Route
              path="/dashboard"
              element={handleRoute(
                <DashboardContextProvider>
                  <DoctorDashboard setNavActive={setNavActive} />
                </DashboardContextProvider>,
                userType === "doctor",
                isLoading,
                isError,
                Boolean(userAuth),
                location.pathname,
              )}
            />
            <Route
              path="*"
              element={
                <ServerError
                  status={404}
                  message="This page doesn't exist"
                  extra
                />
              }
            />
          </Routes>
        </div>
      </div>
      {location.pathname === "/" && (
        <div className="bg-bg-bar text-center capitalize">
          <Footer />
        </div>
      )}
    </div>
  );
}
