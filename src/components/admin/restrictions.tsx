import ChatRestrict from "@/components/admin/chat-restrict";
import UserAvatar from "@/components/ui/user-avatar";
import ChatContextProvider from "@/contexts/chat-context";
import type { ManagedUser } from "@/types/user";

// Chat is the only kind of restriction so far.
const restrictType = "chat";

export default function Restrictions({
  selectedUser,
}: {
  selectedUser: ManagedUser;
}) {
  return (
    <div className="">
      <div className="mb-2 flex flex-wrap justify-evenly sm:justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <UserAvatar
            className="w-12 h-12 p-1 bg-gray-600"
            src={selectedUser.img_url}
            userType={selectedUser.user_type}
          />
          <span className="text-xl text-gray-400">
            {selectedUser.nick_name}
          </span>
        </div>
        <div className="p-1 bg-gray-100 shadow-md rounded-md font-medium">
          {restrictType.toUpperCase()} RESTRICTIONS
        </div>
      </div>
      <hr className="border-2" />
      <ChatContextProvider>
        <ChatRestrict userid={selectedUser.user_id} />
      </ChatContextProvider>
    </div>
  );
}
