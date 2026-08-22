import { Menu, EllipsisVertical } from "lucide-react";
import {
  Avatar,
  Button,
  Menu as AntMenu,
  Typography,
} from "@/components/ui/kit";
import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { Link, useLocation, useNavigate } from "react-router-dom";
import clinicLogo from "@/assets/images/clinic.png";
import items from "@/components/layout/nav-items";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";

const { Title } = Typography;
function Navbar({ DoctorRef }: any) {
  const { messageApi } = useUtilsContext();
  const { setUserData, userData: user, isLoading } = useUserContext();
  const navigate = useNavigate();
  const isMobile = useMediaQuery({
    query: "(max-width:678px)",
  });
  const [showMenu, setShowMenu] = useState(false);
  const navElement = useRef(null);
  const [navWidth, setNavWidth] = useState(290);
  const menuElement = useRef(null);
  const location = useLocation();
  function toggle() {
    setShowMenu(function (state?: any, ..._args: any[]) {
      return !state;
    });
  }
  useEffect(
    function () {
      setShowMenu(false);
      setTimeout(function () {
        if (menuElement?.current?.menu?.list?.style && navElement.current) {
          menuElement.current.menu.list.style.transition = "none !important";
          navElement.current.style.transition = "none";
          setTimeout(function () {
            if (menuElement?.current?.menu?.list?.style && navElement.current) {
              navElement.current.style.transition = "";
              menuElement.current.menu.list.style.transition =
                "background 0.3s, width 0.3s cubic-bezier(0.2, 0, 0, 1) 0s,height 0.5s ease";
            }
          });
        }
      });
    },
    [isMobile],
  );
  const mobileMenuHeight = showMenu
    ? `${menuElement?.current?.menu?.list?.children?.length * 48}px`
    : "0px";
  return (
    !(
      (isMobile && location.pathname.includes("/chat")) ||
      location.pathname.includes("/admin")
    ) && (
      <div
        ref={navElement}
        className={`z-20 min-w-36 bg-blue-950 border-r border-white transition duration-500 max-md:flex max-md:min-w-56 max-md:w-full max-md:flex-row max-md:flex-wrap max-md:items-center max-md:justify-between ${
          isMobile
            ? "relative"
            : "fixed flex h-full w-1/5 min-w-72 max-w-72 flex-col"
        }`}
        style={{
          marginLeft: `${!isMobile ? -navWidth : 0}px`,
        }}
      >
        {!isMobile ? (
          <>
            <div
              className="show--navbar items-center justify-end flex
          -z-10 absolute cursor-pointer bg-blue-950 size-11 top-8 left-full -ml-4 rounded-r-full"
              onClick={function () {
                setNavWidth(function (width?: any, ..._args: any[]) {
                  return width == 0 ? navElement?.current?.offsetWidth : 0;
                });
              }}
            >
              <EllipsisVertical className="text-gray-100 size-6 mr-1" />
            </div>
          </>
        ) : null}

        <div
          className={
            isMobile
              ? `mx-1 w-full flex items-center
      justify-between flex-wrap gap-2`
              : "text-center"
          }
        >
          <Link
            to="/"
            className="text-center max-md:relative max-md:flex max-md:flex-row max-md:items-center max-md:justify-start max-md:gap-1 [&_h3]:max-md:mb-0"
          >
            <Avatar
              src={clinicLogo}
              size="large"
              shape="square"
              className="navbar--logo--view mt-4 mb-1"
            ></Avatar>
            <Title
              level={3}
              className={`navbar--logo--title ${
                isMobile ? "text-gray-100" : "text-blue-100"
              }`}
            >
              Clinicify
            </Title>
          </Link>
          {isMobile ? (
            <Button
              onClick={toggle}
              className="flex h-10 grow items-center justify-center max-md:w-1/3"
            >
              <Menu className="size-4" />
            </Button>
          ) : null}
        </div>
        <AntMenu
          ref={menuElement}
          theme="dark"
          mode={!isMobile ? "inline" : "vertical"}
          className={`mt-8 overflow-hidden px-1 text-base bg-blue-950 border-r border-white transition-all duration-300 ease-out max-md:mt-0 max-md:w-full max-md:[&_li:hover]:bg-emerald-400 ${
            isMobile
              ? "sm absolute top-full"
              : "overflow-x-hidden overflow-y-auto"
          }`}
          style={{
            height: `${!isMobile ? "" : mobileMenuHeight}`,
          }}
          items={items(
            navigate,
            location,
            DoctorRef,
            user,
            messageApi,
            setUserData,
            isMobile,
            isLoading,
          )}
          onClick={toggle}
        ></AntMenu>
      </div>
    )
  );
}

export default Navbar;
