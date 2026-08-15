import { PoweroffOutlined } from "@ant-design/icons";
import { Button, Skeleton } from "antd";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";

const UserItem = (_props?: any) => {
  const { messageApi } = useUtilsContext();
  const { isloading, setUserData, userData: user } = useUserContext();
  const navigate = useNavigate();
  const isMobile = useMediaQuery({
    query: "(max-width:678px)",
  });
  const [showLogout, setShowLogout] = useState(false);
  useEffect(() => {
    document.querySelector(".user--nav--wrapper");
  }, []);
  const location = useLocation();
  return !isloading && user ? (
    <div
      onTouchMove={() => {
        setShowLogout(true);
      }}
      onMouseEnter={() => {
        setShowLogout(true);
      }}
      onTouchEnd={() => {
        setShowLogout(false);
      }}
      onMouseLeave={() => {
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
        <div
          style={{
            left: `calc(100% - 40px)`,
          }}
          className="absolute z-20 flex items-center"
        >
          <Button
            shape="circle"
            size="small"
            icon={<PoweroffOutlined />}
            className="text-white flex
            justify-center align-center
            shadow-md mr-1 bg-red-700 hover:bg-red-600
            rounded border font-bold hover:text-white"
            style={{
              width: "35px",
              height: "35px",
            }}
            onClick={() => {
              messageApi.open({
                type: "loading",
                content: "logout...",
                duration: 1,
              });
              new Cookies().remove("accessToken");
              if (location?.pathname != "/") {
                setTimeout(
                  () =>
                    messageApi.open({
                      key: 1,
                      type: "loading",
                      content: "Redirecting to your home page...",
                      duration: 1,
                    }),
                  1000,
                );
                setTimeout(() => {
                  navigate(`/`);
                  setUserData(null);
                }, 2000);
              } else setTimeout(() => setUserData(null), 1000);
            }}
          ></Button>
        </div>
      )}
    </div>
  ) : (
    <Skeleton.Button active className="w-full" />
  );
};

export default UserItem;
