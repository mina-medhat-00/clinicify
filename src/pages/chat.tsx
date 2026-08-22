import { Rate } from "@/components/ui";
import { ArrowLeft, ArrowUp, CircleAlert, User, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { Link } from "react-router-dom";
import Cookies from "universal-cookie";
import Cards from "@/components/chat/chat-cards";
import Messages from "@/components/chat/chat-messages";
import UserAvatar from "@/components/ui/user-avatar";
import { useChatContext } from "@/contexts/chat-context";
import MessagesContextProvider from "@/contexts/messages-context";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";

export default function Chat(_props: any) {
  const { messageApi, socket, timeZone } = useUtilsContext();
  const { fetchUserData, userData: user } = useUserContext();
  const { fetchChatData, chatData, isLoading, isError } = useChatContext();
  const isMobile = useMediaQuery({
    query: "(max-width:678px)",
  });
  const [withUser, setWithUser] = useState(function () {
    return parseInt(window.localStorage.getItem("chatTo")) || null;
  });
  useEffect(
    function () {
      const cookies = new Cookies();
      if (user?.user_id) {
        socket.emit("join_user", user.user_id);
      }
      function fetchChat() {
        fetchChatData(
          true,
          cookies.get("accessToken"),
          {
            chat_to: withUser,
          },
          true,
        );
      }
      socket?.on("new_chat", fetchChat);
      fetchChatData(true, cookies.get("accessToken"), {
        chat_to: withUser,
      });
      return function () {
        socket.off("new_chat", fetchChat);
      };
    },
    [fetchChatData, socket, user?.user_id, withUser],
  );
  useEffect(
    function () {
      if (withUser) window.localStorage.setItem("chatTo", String(withUser));
    },
    [withUser],
  );
  const chatRecord = chatData?.find(function ({ user_id }: any) {
    return user_id == withUser;
  });
  const me = user?.user_id === withUser ? true : false;
  return (
    <div className={`flex h-screen ${isMobile && "flex-col"}`}>
      {isError ? (
        <div className="p-1 flex flex-col bg-red-500/70 justify-evenly items-center">
          <span className="text-white font-medium text-xl sm:text-2xl lg:text-3xl">
            No Users
          </span>
          <CircleAlert className="text-white size-32 md:size-36" />
          <Link
            to="/chat"
            className="p-3 sm:p-4 text-xl sm:mx-2 sm:text-3xl rounded-lg text-white bg-blue-800/70 hover:bg-blue-800/90"
          >
            Refresh Now
          </Link>
        </div>
      ) : (
        <Cards
          isLoading={isLoading}
          withUser={withUser}
          setWithUser={setWithUser}
          chatData={chatData}
          isMobile={isMobile}
          me={me}
          userId={user?.user_id}
        />
      )}
      {chatRecord || isLoading ? (
        <div
          className={`grow justify-between flex flex-col bg-gray-200 text-gray-700 px-2 h-full`}
        >
          {!isMobile && !isError && (
            <div className="flex justify-between border-b rounded-md p-2 bg-white items-center border-gray-100 shadow-sm">
              <div className="flex gap-2 items-center">
                <UserAvatar
                  src={chatRecord?.img_url}
                  userType={chatRecord?.user_type}
                >
                  {chatRecord?.nick_name?.[0]?.toUpperCase()}
                </UserAvatar>
                <div>
                  <div className="text-gray-700 font-medium">
                    {me ? "ME" : chatRecord?.nick_name}
                  </div>
                  {chatRecord?.specialty && (
                    <div className="text-gray-500">{chatRecord?.specialty}</div>
                  )}
                </div>
              </div>

              <div className="text-lg font-medium">
                {chatRecord?.user_type?.toUpperCase()}
              </div>
              {chatRecord?.user_type == "doctor" && (
                <Rate disabled value={chatRecord?.rate} />
              )}
            </div>
          )}
          <MessagesContextProvider fetchUserData={fetchUserData}>
            <Messages
              key={withUser || "user"}
              isOpen={
                chatRecord?.user_type == "admin" && !chatRecord?.chat_from
                  ? true
                  : user?.user_type == "user" && withUser !== user?.user_id
                    ? chatRecord?.is_open == 1
                    : !chatRecord?.is_open ||
                      ((chatRecord?.user_type == "user" ||
                        user?.user_type == "admin") &&
                        chatRecord?.chat_from)
              }
              withNickName={chatRecord?.nick_name}
              socket={socket}
              withUser={withUser}
              withUserType={chatRecord?.user_type}
              user_id={user?.user_id}
              isMobile={isMobile}
              fetchUserData={fetchUserData}
              messageApi={messageApi}
              timeZone={timeZone || ""}
              isNew={!(chatRecord?.chat_from && chatRecord?.chat_to)}
            />
          </MessagesContextProvider>
        </div>
      ) : (
        <div className="flex flex-col gap-4 h-full grow items-center justify-center">
          {chatData?.length ? (
            <>
              {isMobile ? (
                <ArrowUp className="size-16 text-blue-700  m-0" />
              ) : (
                <ArrowLeft className="size-16 text-blue-700 m-0" />
              )}
              <span className="text-xl text-blue-900 font-medium">
                Choose User To Chat
              </span>
              <User className="text-blue-600 size-32 md:size-36" />
            </>
          ) : (
            <>
              <span className="text-gray-700 font-medium text-xl">
                No Users
              </span>
              <Link to="/doctors">
                <UserPlus className="text-blue-950 size-32 md:size-36" />
              </Link>
              <Link
                to="/doctors"
                className="p-3 sm:p-4 text-xl sm:text-3xl rounded-lg text-white bg-gray-800 hover:bg-gray-900"
              >
                Chat with Doctor Now
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
