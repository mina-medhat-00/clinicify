import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/controls";
import { Skeleton } from "@/components/ui/display";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearToken } from "@/services/client";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";

export default function UserItem() {
  const { messageApi } = useUtilsContext();
  const { isLoading, setUserData, userData: user } = useUserContext();
  const navigate = useNavigate();
  const isMobile = useMediaQuery({
    query: "(max-width:678px)",
  });
  const [showLogout, setShowLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const location = useLocation();
  // Sign out only once the home page shows: clearing the user while still on
  // a protected page would bounce to the login page instead.
  useEffect(
    function () {
      if (loggingOut && location.pathname === "/") setUserData(null);
    },
    [loggingOut, location.pathname, setUserData],
  );
  return !isLoading && user ? (
    <div
      onTouchMove={function () {
        setShowLogout(true);
      }}
      onMouseEnter={function () {
        setShowLogout(true);
      }}
      onTouchEnd={function () {
        setShowLogout(false);
      }}
      onMouseLeave={function () {
        setShowLogout(false);
      }}
      className="user--nav--wrapper text-center rounded-bl-lg
          rounded-br-lg inline-flex cursor-pointer
      grow justify-between items-center"
    >
      <Link
        to={
          user.user_type === "user"
            ? `/profile/${user.user_name}`
            : user.user_type === "admin"
              ? "/admin"
              : "/dashboard"
        }
        className="text-white grow inline-block
          font-bold hover:text-white z-10"
      >
        <Button className="w-full h-full bg-transparent text-white p-1 border-0 font-bold hover:text-white">
          {user.nick_name || "Profile"}
        </Button>
      </Link>
      {(showLogout || isMobile) && (
        <div className="absolute z-20 flex items-center right-10">
          <Button
            shape="circle"
            size="small"
            icon={<LogOut className="size-3.5" />}
            className="text-white flex size-9
            justify-center items-center
            shadow-md mr-1 bg-red-700 hover:bg-red-600
            rounded border font-bold hover:text-white"
            onClick={function () {
              messageApi.open({
                type: "loading",
                content: "logout...",
                duration: 1,
              });
              clearToken();
              setLoggingOut(true);
              if (location.pathname !== "/") {
                setTimeout(function () {
                  messageApi.open({
                    key: 1,
                    type: "loading",
                    content: "Redirecting to your home page...",
                    duration: 1,
                  });
                }, 1000);
                setTimeout(function () {
                  void navigate("/");
                }, 2000);
              }
            }}
          ></Button>
        </div>
      )}
    </div>
  ) : (
    <Skeleton.Button active className="w-full" />
  );
}
