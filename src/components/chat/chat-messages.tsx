import { Input } from "@/components/ui/controls";
import { Skeleton } from "@/components/ui/display";
import dayjs from "dayjs";
import EmojiPicker from "emoji-picker-react";
import { Loader2, Send, Smile } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import ChatAvailability from "@/components/chat/chat-availability";
import Message from "@/components/chat/chat-message";
import AppointmentContextProvider from "@/contexts/appointment-context";
import { useChatContext } from "@/contexts/chat-context";
import { useMessagesContext } from "@/contexts/messages-context";
import type { ServiceContext } from "@/services/client";
import submitMessage, { chatRoomId } from "@/services/submit-message";
import type { ChatMessage } from "@/types/content";
import type { Id, UserType } from "@/types/user";

function getDate(message: ChatMessage | undefined, timeZone: string) {
  return message
    ? dayjs(`${message.issued_date} ${message.issued_time} ${timeZone}`).format(
        "YYYY-MM-DD",
      )
    : null;
}

export default function Messages({
  isMobile,
  fetchUserData,
  withUser,
  user_id,
  messageApi,
  socket,
  isOpen,
  withUserType,
  withNickName,
  timeZone,
}: ServiceContext & {
  isMobile: boolean;
  withUser: Id;
  user_id: Id;
  socket: Socket;
  // The signed-in user may write in this chat now.
  isOpen: boolean;
  withUserType?: UserType;
  withNickName?: string;
  timeZone: string;
}) {
  const {
    fetchMessagesData,
    messagesData,
    isError: isMessageError,
    isLoading: isMessageLoading,
  } = useMessagesContext();
  const { fetchChatData, isError: isChatError } = useChatContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prevMessagesData, setPrevMessagesData] = useState(messagesData);
  if (messagesData !== prevMessagesData) {
    setPrevMessagesData(messagesData);
    setMessages(messagesData ?? []);
  }
  const [message, setMessage] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isError = isChatError || isMessageError;
  useEffect(
    function () {
      void fetchMessagesData({ message_to: withUser });
      // Skip a message we already have (the sender also reloads its list).
      function addMessage(incoming: ChatMessage) {
        setMessages(function (current) {
          const known = current.slice(-2).some(function ({ message_id }) {
            return message_id === incoming.message_id;
          });
          return known ? current : [...current, incoming];
        });
      }
      socket.on("receive_message", addMessage);
      return function () {
        socket.off("receive_message", addMessage);
      };
    },
    [fetchMessagesData, socket, withUser],
  );
  useEffect(
    function () {
      socket.emit("join_chat", chatRoomId(withUser, user_id));
    },
    [withUser, user_id, socket],
  );

  return (
    <>
      <div className="message--container flex flex-col-reverse border-gray-100 px-4 overflow-auto scroll--v scroll--v--chat">
        <div
          className={`${
            isMessageLoading ? "overflow-hidden" : ""
          } grow flex flex-col gap-3`}
        >
          {!isMessageLoading
            ? messages.map(function (item, i, arr) {
                const { content, message_from, issued_date, issued_time } =
                  item;
                const day = getDate(item, timeZone);
                return (
                  <Fragment key={item.message_id ?? i}>
                    {/* A date line before each new day. */}
                    {getDate(arr[i - 1], timeZone) !== day && (
                      <div className="block w-fit mr-auto ml-auto text-white grow border border-white bg-blue-500/50 rounded-lg text-center py-1 my-2 px-4 font-medium overflow-auto">
                        {day}
                      </div>
                    )}
                    <Message
                      isMobile={isMobile}
                      content={content}
                      me={message_from === user_id}
                      issued_time={new Date(
                        `${issued_date} ${issued_time} ${timeZone}`,
                      ).toLocaleTimeString("en", {
                        hour: "numeric",
                        minute: "numeric",
                      })}
                    />
                  </Fragment>
                );
              })
            : Array.from({ length: 10 }).map(function (_, i) {
                return (
                  <Skeleton.Button
                    key={i}
                    size={65}
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
              onChange={function (event) {
                setMessage(event.target.value);
              }}
              className="rounded-lg"
              value={message}
            />
            <Smile
              onClick={function () {
                setEmojiOpen(function (open) {
                  return !open;
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
                    setIsLoading(true);
                    void submitMessage({
                      content: message,
                      messageTo: withUser,
                      userId: user_id,
                      // First message of the conversation: tell the other user.
                      isFirst: !messages.length,
                      socket,
                      messageApi,
                      fetchUserData,
                    }).then(function (result) {
                      setIsLoading(false);
                      if (result === "sent") {
                        setMessage("");
                        void fetchMessagesData(
                          { message_to: withUser },
                          { silent: true },
                        );
                      } else if (result === "closed") {
                        void fetchChatData(
                          { chat_to: withUser },
                          { silent: true },
                        );
                      }
                    });
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
              width="100%"
              height="190px"
              onEmojiClick={function (data) {
                setMessage(function (current) {
                  return current + data.emoji;
                });
              }}
            />
          )}
        </div>
      ) : withUserType === "doctor" && !isError && !isMessageLoading ? (
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
            <div className="text-lg text-gray-300 font-bold">
              Cannot Chat with {withNickName ?? "That User"} right now
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
