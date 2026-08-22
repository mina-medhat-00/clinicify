import axios from "axios";
import Cookies from "universal-cookie";
import { apiUrl } from "@/utils/api";

const cookies = new Cookies();
async function submitMessage(
  fetchUserData?: any,
  fetchMessagesData?: any,
  messageApi?: any,
  content?: any,
  message_to?: any,
  isFirst?: any,
  socket?: any,
  setContent?: any,
  user_id?: any,
  setIsLoading?: any,
  fetchChatData?: any,
) {
  const data = { content, message_to, isFirst };
  setIsLoading(true);
  axios
    .post(
      apiUrl("/submit/message"),
      {
        data,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies?.get("accessToken")}`,
        },
      },
    )
    .then(function (res?: any, ..._args: any[]) {
      setContent("");
      if (isFirst) {
        socket.emit("add_chat", message_to);
      }
      socket.emit("send_message", {
        message_id: res?.data?.data?.message_id,
        content,
        chatId: `${message_to > user_id ? message_to : user_id},${
          user_id > message_to ? message_to : user_id
        }`,
        message_to,
        message_from: user_id,
        issued_date: res?.data?.data?.issued_date,
        issued_time: res?.data?.data?.issued_time,
      });
      fetchMessagesData(
        cookies?.get("accessToken"),
        {
          message_to,
        },
        true,
      );
      setIsLoading(false);
    })
    .catch(function (err?: any, ..._args: any[]) {
      setIsLoading(false);
      if (err?.response?.status == 401) {
        fetchUserData(true, cookies.get("accessToken"));
      } else if (err?.response?.status == 403) {
        fetchChatData(
          true,
          cookies.get("accessToken"),
          {
            chat_to: message_to,
          },
          true,
        );
        messageApi.open({
          key: 1,
          content: "we're sorry but your chat is closed now",
          type: "warning",
          duration: 2,
        });
      } else
        messageApi.open({
          key: 1,
          content: "there's some issues cannot submit your comment now",
          type: "error",
          duration: 2,
        });
    });
}

export default submitMessage;
