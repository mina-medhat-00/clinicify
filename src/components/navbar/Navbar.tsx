import { useEffect, useRef, useState } from "react";
import { Button, Typography, Menu, Avatar } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import clinicLogo from "@/assets/images/clinic.png";
import { useMediaQuery } from "react-responsive";
import { MenuOutlined } from "@ant-design/icons";
import items from "@/utils/navbar/navItems";
import { FaEllipsisV } from "react-icons/fa";
import { useUtilsContext } from "@/hooks/UtilsContextProvider";
import { useUserContext } from "@/hooks/UserContextProvider";
import LangItem from "@/utils/navbar/LangItem";

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
      if (menuElement?.current?.menu?.list?.style) {
        menuElement.current.menu.list.style.transition = "none !important";
        navElement.current.style.transition = "none";
        setTimeout(() => {
          if (menuElement?.current?.menu?.list?.style) {
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
    ? // eslint-disable-next-line react-hooks/refs -- legacy height animation reads the menu DOM size from a ref during render
      `${menuElement?.current?.menu?.list?.children?.length * 48}px`
    : "0px";
  return (
    !(
      (isMobile && location.pathname.includes("/chat")) ||
      location.pathname.includes("/admin")
      // ||
      //(location.pathname.includes("/dashboard") &&
      //window.localStorage.getItem("dashType") == "chat")
    ) && (
      <div
        ref={navElement}
        className={`z-20 min-w-[150px] bg-bg-bar transition-[margin-left] duration-500 max-[678px]:flex max-[678px]:min-w-[220px] max-[678px]:w-full max-[678px]:flex-row max-[678px]:flex-wrap max-[678px]:items-center max-[678px]:justify-between ${
          isMobile ? "relative bg-gray-800" : "fixed flex h-full w-1/5 flex-col"
        }`}
        style={{
          marginLeft: `${!isMobile ? -navWidth : 0}px`,
          minWidth: isMobile ? undefined : "290px",
          maxWidth: isMobile ? undefined : "290px",
          boxShadow: "inset -1px 0px white",
          // backgroundColor: !isMobile ? "rgb(8 14 20)" : "",
          backgroundColor: "rgb(20, 57, 94)",
        }}
      >
        {!isMobile ? (
          <>
            {/* <div
              className="icon--mask"
              style={{
                // backgroundColor: "rgb(6 16 20)",
                backgroundColor: "white",
                width: "1px",
                top: "5%",
                height: "50px",
                left: "calc(100% - 1px)",
              }}
            ></div> */}
            <div
              className="show--navbar items-center justify-end flex
          -z-10 absolute cursor-pointer"
              style={{
                // backgroundColor: "rgb(6 16 20)",
                backgroundColor: "rgb(20 57 94)",
                width: "45px",
                height: "45px",
                top: "5%",
                /* border: 12px transparent solid; */
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
              {/* {navWidth != 0 ? (
            <TbLayoutSidebarRightCollapse
            size={50 as any}
              className={`
              ${
                location?.pathname == "/" ||
                location?.pathname.includes("doctors")
                  ? "bg-gray-300 rounded-xl"
                  : "text-gray-200 bg-gray-700 rounded-xl"
              }`}
              color={`${
                location?.pathname == "/" ||
                location?.pathname.includes("doctors")
                  ? "rgb(8 14 20)"
                  : ""
              }`}
              />
          ) : (
            <TbLayoutSidebarLeftCollapse
            size={50 as any}
            className={`
               ${
                 location?.pathname == "/" ||
                 location?.pathname.includes("doctors")
                 ? "bg-gray-300 rounded-xl"
                   : "text-gray-200 bg-gray-700 rounded-xl"
                  }`}
              color={`${
                location?.pathname == "/" ||
                location?.pathname.includes("doctors")
                ? "rgb(8 14 20)"
                : ""
              }`}
              />
            )} */}
            </div>
          </>
        ) : null}
        {/* {!isMobile && (
          <SignBanner
            messageApi={messageApi}
            isUserLoading={isUserLoading}
            setShowMenu={setShowMenu}
            user={user}
            setUserData={setUserData}
          />
        )} */}
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
            className="text-center max-[678px]:relative max-[678px]:flex max-[678px]:flex-row max-[678px]:items-center max-[678px]:justify-start max-[678px]:gap-[3px] [&_h3]:max-[678px]:!mb-0 [&_a]:!text-[#cdd5ff]"
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
              className="flex !h-10 grow items-center justify-center max-[678px]:w-[calc(30%-20px)]"
            >
              <MenuOutlined />
            </Button>
          ) : null}
        </div>
        <Menu
          ref={menuElement}
          theme="dark"
          mode={!isMobile ? "inline" : "vertical"}
          className={`!mt-[30px] overflow-hidden max-[678px]:!mt-0 max-[678px]:w-full max-[678px]:[&_li:hover]:!bg-[rgb(93,207,148)] ${lan == "ar" ? "ar--nav" : ""} ${
            isMobile
              ? "sm absolute top-full"
              : "!overflow-x-hidden !overflow-y-auto"
          }`}
          style={{
            paddingInline: "5px",
            height: `
        ${!isMobile ? "" : mobileMenuHeight}`,
            transition:
              "background 0.3s, width 0.3s cubic-bezier(0.2, 0, 0, 1) 0s,height 0.5s ease",
            fontSize: "medium",
            // backgroundColor:"#285885",
            backgroundColor: "rgb(20, 57, 94)",
            // backgroundColor: !isMobile ? "rgb(8 14 20)" : "",
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
