import { Input, Skeleton } from "@/components/ui";
import dayjs from "dayjs";
import EmojiPicker from "emoji-picker-react";
import { Loader2, Send, Smile } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Cookies from "universal-cookie";
import ChatAvailability from "@/components/chat/chat-availability";
import Message from "@/components/chat/chat-message";
import { AppointmentContextProvider } from "@/contexts";
import { useChatContext } from "@/contexts/chat-context";
import { useMessagesContext } from "@/contexts/messages-context";
import submitMessage from "@/services/submit-message";

function getDate(issued_date?: any, issued_time?: any, timeZone?: any) {
  return issued_date
    ? dayjs(`${issued_date} ${issued_time} ${timeZone}`).format("YYYY-DD-MM")
    : null;
}
export default function Messages({
  isMobile,
  fetchUserData,
  withUser,
  user_id,
  messageApi,
  socket,
  isNew,
  isOpen,
  withUserType,
  withNickName,
  timeZone,
}: any) {
  const {
    fetchMessagesData,
    messagesData,
    isError: isMessageError,
    isLoading: isMessageLoading,
  } = useMessagesContext();
  const { fetchChatData, isError: isChatError } = useChatContext();
  const [messages, setMessages] = useState([]);
  const [prevMessagesData, setPrevMessagesData] = useState(messagesData);
  if (messagesData !== prevMessagesData) {
    setPrevMessagesData(messagesData);
    setMessages(messagesData || []);
  }
  const messageContainer = useRef(null);
  const [message, setMessage] = useState<any>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isError = isChatError || isMessageError;
  useEffect(
    function () {
      if (withUser)
        fetchMessagesData(new Cookies().get("accessToken"), {
          message_to: withUser,
        });
      function addMessage(m1?: any) {
        setMessages(function (m?: any) {
          const m2 = new Array(...(m ? m : []));
          return m2?.splice(m2?.length - 2)?.some(function ({
            message_id,
          }: any) {
            return m1?.message_id == message_id;
          })
            ? m
            : [...m, m1];
        });
      }
      socket?.on("receive_message", addMessage);
      return function () {
        socket.off("receive_message", addMessage);
      };
    },
    [fetchMessagesData, socket, withUser],
  );
  useEffect(
    function () {
      if (withUser && user_id)
        socket?.emit(
          "join_chat",
          `${withUser > user_id ? withUser : user_id},${
            user_id > withUser ? withUser : user_id
          }`,
        );
    },
    [withUser, user_id, socket],
  );

  return (
    <>
      <div
        ref={messageContainer}
        className="message--container flex flex-col-reverse border-gray-100 px-4 overflow-auto scroll--v scroll--v--chat"
      >
        <div
          className={`${
            isMessageLoading ? "overflow-hidden" : ""
          } grow flex flex-col gap-3`}
        >
          {!isMessageLoading
            ? messages?.map(function (
                { content, message_from, issued_date, issued_time }: any,
                i?: any,
                arr?: any,
              ) {
                return (
                  <React.Fragment key={i + 1}>
                    {getDate(arr[i - 1]?.issued_date, issued_time, timeZone) !==
                      getDate(issued_date, issued_time, timeZone) && (
                      <div
                        className={`block w-fit mr-auto ml-auto text-white grow border border-white bg-blue-500/50 
                  rounded-lg text-center py-1 my-2 px-4 font-medium
                  ${isMessageLoading ? "overflow-hidden" : "overflow-auto"}
                  `}
                      >
                        {getDate(issued_date, issued_time, timeZone)}
                      </div>
                    )}
                    <Message
                      key={i + 1}
                      isMobile={isMobile}
                      content={content}
                      me={message_from == user_id}
                      issued_time={new Date(
                        `${issued_date} ${issued_time} ${timeZone}`,
                      ).toLocaleTimeString("en", {
                        hour: "numeric",
                        minute: "numeric",
                      })}
                    />
                  </React.Fragment>
                );
              })
            : Array.from({ length: 10 }).map(function (_?: any, i?: any) {
                return (
                  <Skeleton.Button
                    key={i + 1}
                    size={65 as any}
                    className={`w-2/3 lg:w-1/2 p-1 flex rounded-md ${
                      !(i % 2) ? "" : "ml-auto"
                    }`}
                    active
                  />
                );
              })}
        </div>
      </div>
      {isOpen && !isError && !isMessageLoading ? (
        <div className="bg-gray-100 mt-2 rounded-lg">
          <div className="flex gap-2 items-center p-2">
            <Input
              onChange={function (e?: any) {
                setMessage(e?.target?.value);
              }}
              className="rounded-lg"
              value={message}
            />
            <Smile
              onClick={function () {
                setEmojiOpen(function (val?: any) {
                  return !val;
                });
              }}
              className={`flex cursor-pointer items-center text-3xl ${
                emojiOpen ? "text-green-700" : "text-green-400"
              }`}
            />
            {message &&
              (isLoading ? (
                <Loader2 className="flex hover:text-blue-600 cursor-pointer items-center text-3xl text-blue-700 animate-spin" />
              ) : (
                <Send
                  className="flex hover:text-blue-600 cursor-pointer items-center text-3xl text-blue-700"
                  onClick={function () {
                    submitMessage(
                      fetchUserData,
                      fetchMessagesData,
                      messageApi,
                      message,
                      withUser,
                      isNew && messages?.length,
                      socket,
                      setMessage,
                      user_id,
                      setIsLoading,
                      fetchChatData,
                    );
                  }}
                />
              ))}
          </div>
          {emojiOpen && (
            <EmojiPicker
              searchDisabled
              previewConfig={{
                showPreview: false,
              }}
              width={"100%"}
              height={"190px"}
              onEmojiClick={function (data?: any) {
                setMessage(function (m?: any) {
                  return (m || "") + data?.emoji;
                });
              }}
            />
          )}
        </div>
      ) : withUserType == "doctor" && !isError && !isMessageLoading ? (
        <AppointmentContextProvider>
          <ChatAvailability
            withUserType={withUserType}
            withUser={withUser}
            timeZone={timeZone}
            withNickName={withNickName}
          />
        </AppointmentContextProvider>
      ) : !isMessageLoading ? (
        <div className="bg-gray-600 px-1 rounded-tr-lg py-8 rounded-tl-lg font-medium text-white">
          <div className="text-center">
            <div className="text-lg text-gray-300  font-bold">
              Cannot Chat with {withNickName || isError || "That User"} right
              now
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
