import { MenuOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Menu,
  Typography,
} from "antd";
import { useEffect, useRef, useState } from "react";
import { FaEllipsisV } from "react-icons/fa";
import { useMediaQuery } from "react-responsive";
import { Link, useLocation, useNavigate } from "react-router-dom";
import clinicLogo from "@/assets/images/clinic.png";
import LangItem from "@/components/layout/lang-item";
import items from "@/components/layout/nav-items";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";

const { Title } = { ...Typography, ...Menu };
const Navbar = ({ DoctorRef }: any) => {
  const { messageApi, lan, t } = useUtilsContext();
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
  const toggle = () => {
    setShowMenu((state?: any, ..._args: any[]) => !state);
  };
  useEffect(() => {
    setShowMenu(false);
    setTimeout(() => {
      if (menuElement?.current?.menu?.list?.style && navElement.current) {
        menuElement.current.menu.list.style.transition = "none !important";
        navElement.current.style.transition = "none";
        setTimeout(() => {
          if (menuElement?.current?.menu?.list?.style && navElement.current) {
            navElement.current.style.transition = "";
            menuElement.current.menu.list.style.transition =
              "background 0.3s, width 0.3s cubic-bezier(0.2, 0, 0, 1) 0s,height 0.5s ease";
          }
        });
      }
    });
  }, [isMobile]);
  // The mobile menu height is animated from the rendered menu's item count.
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
        className={`z-20 min-w-37.5 bg-bg-bar transition-[margin-left] duration-500 max-[678px]:flex max-[678px]:min-w-55 max-[678px]:w-full max-[678px]:flex-row max-[678px]:flex-wrap max-[678px]:items-center max-[678px]:justify-between ${
          isMobile ? "relative bg-gray-800" : "fixed flex h-full w-1/5 flex-col"
        }`}
        style={{
          marginLeft: `${!isMobile ? -navWidth : 0}px`,
          minWidth: isMobile ? undefined : "290px",
          maxWidth: isMobile ? undefined : "290px",
          boxShadow: "inset -1px 0px white",
          backgroundColor: "rgb(20, 57, 94)",
        }}
      >
        {!isMobile ? (
          <>
            <div
              className="show--navbar items-center justify-end flex
          -z-10 absolute cursor-pointer"
              style={{
                backgroundColor: "rgb(20 57 94)",
                width: "45px",
                height: "45px",
                top: "5%",
                left: "calc(100% - 15px)",
                borderTopRightRadius: "50%",
                borderBottomRightRadius: "50%",
              }}
              onClick={() => {
                setNavWidth((width?: any, ..._args: any[]) =>
                  width == 0 ? navElement?.current?.offsetWidth : 0,
                );
              }}
            >
              <FaEllipsisV className="text-gray-100 text-2xl mr-1" />
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
            className="text-center max-[678px]:relative max-[678px]:flex max-[678px]:flex-row max-[678px]:items-center max-[678px]:justify-start max-[678px]:gap-0.75 [&_h3]:max-[678px]:mb-0 [&_a]:!text-[#cdd5ff]"
          >
            <Avatar
              src={clinicLogo}
              size="large"
              shape="square"
              style={{ marginTop: "15px" }}
              className="navbar--logo--view mt-2 mb-1"
            ></Avatar>
            <Title
              level={3}
              className={`navbar--logo--title ${
                isMobile ? "text-gray-100" : "text-blue-100"
              }`}
            >
              {t("Online Clinic")}
            </Title>
          </Link>
          <LangItem isMobile={isMobile} />
          {isMobile ? (
            <Button
              onClick={toggle}
              className="flex h-10 grow items-center justify-center max-[678px]:w-[calc(30%-20px)]"
            >
              <MenuOutlined />
            </Button>
          ) : null}
        </div>
        <Menu
          ref={menuElement}
          theme="dark"
          mode={!isMobile ? "inline" : "vertical"}
          className={`mt-7.5 overflow-hidden max-[678px]:mt-0 max-[678px]:w-full max-[678px]:[&_li:hover]:!bg-[rgb(93,207,148)] ${lan == "ar" ? "ar--nav" : ""} ${
            isMobile
              ? "sm absolute top-full"
              : "overflow-x-hidden overflow-y-auto"
          }`}
          style={{
            paddingInline: "5px",
            height: `
        ${!isMobile ? "" : mobileMenuHeight}`,
            transition:
              "background 0.3s, width 0.3s cubic-bezier(0.2, 0, 0, 1) 0s,height 0.5s ease",
            fontSize: "medium",
            backgroundColor: "rgb(20, 57, 94)",
            boxShadow: "inset -1px 0px white",
          }}
          items={items(
            t,
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
        ></Menu>
      </div>
    )
  );
};

export default Navbar;
