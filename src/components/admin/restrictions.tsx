import { Avatar } from "antd";
import { useState } from "react";
import ChatRestrict from "@/components/admin/chat-restrict";
import { ChatContextProvider } from "@/contexts";

const Restrictions = ({ selectedUser }: any) => {
  const [restrictType] = useState("chat");
  return (
    <div className="">
      <div className="mb-2 flex flex-wrap justify-evenly sm:justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <Avatar
            className={`w-12 h-12 p-1 bg-gray-600`}
            src={selectedUser?.img_url}
          />
          <span className="text-xl text-gray-400">
            {selectedUser?.nick_name}
          </span>
        </div>
        <div className="p-1 bg-gray-100 shadow-md rounded-md font-medium">
          {restrictType?.toUpperCase()} RESTRICTIONS
        </div>
      </div>
      <hr className="border-2" />
      {restrictType == "chat" ? (
        <ChatContextProvider>
          <ChatRestrict userid={selectedUser?.user_id} />
        </ChatContextProvider>
      ) : null}
    </div>
  );
};

export default Restrictions;
