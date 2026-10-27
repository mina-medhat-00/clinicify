import { Empty, Switch, Tag } from "@/components/ui";
import { useEffect } from "react";
import Loader from "@/components/ui/loader";
import UserAvatar from "@/components/ui/user-avatar";
import { useChatContext } from "@/contexts/chat-context";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";
import changeState from "@/services/change-state";

export default function ChatRestrict({ userid }: any) {
  const { fetchChatData, chatData, isLoading } = useChatContext();
  const { messageApi } = useUtilsContext();
  const { fetchUserData } = useUserContext();
  useEffect(
    function () {
      fetchChatData({ userid });
    },
    [fetchChatData, userid],
  );
  return isLoading ? (
    <Loader />
  ) : chatData?.length ? (
    <div className="overflow-auto mt-2 p-2 flex flex-col gap-2 text-white scroll--v scroll--h max-h-96">
      {chatData?.map(function ({
        user_id,
        img_url,
        nick_name,
        user_type,
        is_open,
      }: any) {
        return (
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
                <UserAvatar
                  className="ml-2"
                  src={img_url}
                  userType={user_type}
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
                } shadow-lg box-content bg-white border-[0.25px] border-solid border-white`}
                onChange={async function (is_open?: any) {
                  const changed = await changeState({
                    action: "restrict",
                    target: "user",
                    chat: { chat_from: userid, chat_to: user_id, is_open },
                    messageApi,
                    fetchUserData,
                  });
                  if (changed) fetchChatData({ userid }, { silent: true });
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
        );
      })}
    </div>
  ) : (
    <Empty
      className="flex flex-col mt-2 justify-center items-center"
      description={
        <span className="font-medium">There's no connections yet</span>
      }
    />
  );
}
