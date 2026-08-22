import { Popover } from "@/components/ui/kit";
import { Bell, ChevronDown, Menu, MessageSquare } from "lucide-react";
import { useEffect } from "react";

function NavButton({ name, title, customFunc, icon, dotColor, dashType }: any) {
  return (
    <Popover
      open={title == "Menu" || dashType == name ? false : null}
      arrow={false}
      content={<span className="text-gray-700 font-medium">{title}</span>}
    >
      <button
        type="button"
        onClick={function () {
          customFunc();
        }}
        className={`relative text-xl rounded-full p-3 ${
          dashType == name ? "bg-gray-700 text-gray-100" : "hover:bg-gray-200"
        }`}
      >
        <span
          className="absolute inline-flex rounded-full h-2 w-2 right-2 top-2"
          style={dotColor ? { background: dotColor } : undefined}
        />
        {icon}
      </button>
    </Popover>
  );
}

function Navbar({
  dashType,
  isMobile,
  setActiveMenu,
  activeMenu,
  setDashType,
  user,
}: any) {
  useEffect(
    function () {
      if (isMobile) {
        setActiveMenu(false);
      } else {
        setActiveMenu(true);
      }
    },
    [isMobile],
  );

  function handleActiveMenu() {
    setActiveMenu(!activeMenu);
  }

  return (
    <div
      className={`flex justify-between border-b-2 bg-white shadow-md border-gray-700/50 p-2 h-16 ${
        dashType == "chat" ? "" : "xl:mx-6"
      } relative`}
    >
      <NavButton
        title="Menu"
        name="menu"
        dashType={dashType}
        customFunc={handleActiveMenu}
        icon={<Menu />}
      />
      <div className="flex">
        <NavButton
          title="Chat"
          name="chat"
          dashType={dashType}
          dotColor="#03C9D7"
          customFunc={function () {
            setDashType("chat");
          }}
          icon={<MessageSquare />}
        />
        <NavButton
          name="reports"
          dashType={dashType}
          title="reports"
          dotColor="rgb(254, 201, 15)"
          customFunc={function () {
            setDashType("reports");
          }}
          icon={<Bell />}
        />
        <div
          className={`${
            dashType == "profile"
              ? "bg-gray-700 text-gray-100"
              : "hover:bg-gray-100 text-gray-400"
          } flex items-center gap-2 cursor-pointer p-1 rounded-lg`}
          onClick={function () {
            setDashType("profile");
          }}
        >
          {user?.img_url ? (
            <img
              className="rounded-full w-8 h-8"
              src={user.img_url}
              alt="user-profile"
            />
          ) : null}
          <p>
            <span className="text-sm">Hi,</span>{" "}
            <span className="font-bold ml-1 text-sm">{user?.nick_name}</span>
          </p>
          <ChevronDown className="text-gray-400 text-sm" />
        </div>
      </div>
    </div>
  );
}

export default Navbar;
