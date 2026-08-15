import {
  Avatar,
  Empty,
  Switch,
  Tag,
} from "antd";
import { useEffect, useState } from "react";
import Cookies from "universal-cookie";
import doctorPhoto from "@/assets/images/doctor-photo.png";
import userPhoto from "@/assets/images/user-photo.png";
import Loader from "@/components/ui/loader";
import { useChatContext } from "@/contexts/chat-context";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";
import changeState from "@/services/change-state";

const ChatRestrict = ({ userid }: any) => {
  const { fetchChatData, chatData, isLoading } = useChatContext();
  const [, setIsLoading] = useState<any>(null);
  const { messageApi } = useUtilsContext();
  const { fetchUserData } = useUserContext();
  useEffect(() => {
    fetchChatData(true, new Cookies().get("accessToken"), { userid });
  }, []);
  return isLoading ? (
    <Loader />
  ) : chatData?.length ? (
    <div
      className="overflow-auto mt-2 p-2 flex flex-col gap-2 text-white scroll--v scroll--h"
      style={{
        maxHeight: "55vh",
      }}
    >
      {chatData?.map(
        ({ user_id, img_url, nick_name, user_type, is_open }: any) => (
          <div
            key={user_id}
            className={`${
              is_open ? "bg-blue-500/70" : "bg-red-500/70"
            } p-2 rounded-md shadow-md`}
          >
            <div className="flex flex-wrap justify-between items-center gap-1">
              <div
                className={`flex gap-2 ${
                  is_open ? "bg-blue-700/70" : "bg-red-600/70"
                } border-r-2 border-gray-100 
            rounded-bl-md rounded-tl-md shadow-md py-1 pr-3 items-center`}
              >
                <Avatar
                  className="ml-2"
                  src={
                    img_url || (user_type == "doctor" ? doctorPhoto : userPhoto)
                  }
                />
                <div className="font-medium">{nick_name}</div>
              </div>
              <Tag className="rounded-md p-1" color={is_open ? "blue" : "red"}>
                <span className="font-medium">
                  {is_open ? "OPENED" : "CLOSED"}
                </span>
              </Tag>
              <Switch
                checked={is_open}
                className={`${
                  !is_open ? "bg-blue-400" : "bg-red-400"
                } shadow-lg`}
                style={{
                  boxSizing: "content-box",
                  background: "white",
                  border: "solid 0.25px white",
                }}
                onChange={(is_open?: any, ..._args: any[]) => {
                  changeState(
                    fetchUserData,
                    fetchChatData,
                    messageApi,
                    setIsLoading,
                    "restrict",
                    {
                      chat_from: userid,
                      chat_to: user_id,
                      is_open,
                    },
                    true,
                  );
                }}
                checkedChildren={
                  <span className="font-medium text-white">Close Chat</span>
                }
                unCheckedChildren={
                  <span className="font-medium text-white">Open Chat</span>
                }
              />
            </div>
          </div>
        ),
      )}
    </div>
  ) : (
    <Empty
      className="flex flex-col mt-2 justify-center items-center"
      description={
        <span className="font-medium">There's no connections yet</span>
      }
    />
  );
};

export default ChatRestrict;
