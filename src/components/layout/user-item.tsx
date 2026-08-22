import { LogOut } from "lucide-react";
import { Button, Skeleton } from "@/components/ui/kit";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";

function UserItem(_props?: any) {
  const { messageApi } = useUtilsContext();
  const { isloading, setUserData, userData: user } = useUserContext();
  const navigate = useNavigate();
  const isMobile = useMediaQuery({
    query: "(max-width:678px)",
  });
  const [showLogout, setShowLogout] = useState(false);
  useEffect(function () {
    document.querySelector(".user--nav--wrapper");
  }, []);
  const location = useLocation();
  return !isloading && user ? (
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
          user?.user_type == "user"
            ? `/profile/${user?.user_name}`
            : user?.user_type == "admin"
              ? `/admin`
              : `/dashboard`
        }
        className="text-white grow inline-block
          font-bold hover:text-white z-10"
      >
        <Button className="w-full h-full bg-transparent text-white p-1 border-0 font-bold hover:text-white">
          {user?.nick_name || "Profile"}
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
              new Cookies().remove("accessToken");
              if (location?.pathname != "/") {
                setTimeout(function () {
                  messageApi.open({
                    key: 1,
                    type: "loading",
                    content: "Redirecting to your home page...",
                    duration: 1,
                  });
                }, 1000);
                setTimeout(function () {
                  navigate(`/`);
                  setUserData(null);
                }, 2000);
              } else
                setTimeout(function () {
                  setUserData(null);
                }, 1000);
            }}
          ></Button>
        </div>
      )}
    </div>
  ) : (
    <Skeleton.Button active className="w-full" />
  );
}

export default UserItem;
