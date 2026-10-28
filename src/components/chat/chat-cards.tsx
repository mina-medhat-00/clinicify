import { Segmented, Skeleton } from "@/components/ui/display";
import { Home } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import UserAvatar from "@/components/ui/user-avatar";
import type { ChatThread } from "@/types/content";
import type { Id, UserType } from "@/types/user";

function UserCard({
  imgUrl,
  name,
  isMobile,
  active,
  userType,
}: {
  imgUrl: string;
  name: string;
  isMobile: boolean;
  active: boolean;
  userType: UserType;
}) {
  return (
    <div className="p-1 text-center">
      <UserAvatar
        src={imgUrl}
        userType={userType}
        alt={name.charAt(0).toUpperCase()}
      />
      <div
        className={`break-all overflow-hidden font-medium text-ellipsis mt-1 max-w-28 min-w-20 ${
          !isMobile
            ? active
              ? "text-white"
              : "text-gray-700"
            : active
              ? "text-gray-700"
              : "text-gray-800"
        }`}
      >
        {name}
      </div>
    </div>
  );
}

export default function Cards({
  isMobile,
  chatData,
  setWithUser,
  withUser,
  userId,
  isLoading,
}: {
  isMobile: boolean;
  chatData: ChatThread[] | null;
  setWithUser: (userId: Id) => void;
  withUser: Id | null;
  userId?: Id;
  isLoading: boolean;
}) {
  // The first row, measured to place the highlight behind the selected row.
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const threads = chatData ?? [];
  const selectedIndex = threads.findIndex(function ({ user_id }) {
    return user_id === withUser;
  });
  return isMobile ? (
    <div className="wrapper shrink-0 flex gap-2 items-center bg-gray-600 p-2 h-20">
      <Link
        to="/"
        className="bg-gray-700 hover:bg-gray-800 p-2 rounded-lg border"
      >
        <Home className="flex justify-center items-center text-4xl text-gray-100" />
      </Link>
      <div className="w-0.5 h-full bg-gray-700"></div>
      <div
        className={`${
          isLoading ? "overflow-hidden" : "overflow-auto"
        } scroll--v scroll--h py-1 scroll--h--chat scroll--h--chat--white`}
      >
        {isLoading ? (
          <div className="flex gap-2">
            {Array.from({ length: 10 }).map(function (_, i) {
              return (
                <Skeleton.Button
                  size={60}
                  className="bg-gray-100/40 rounded"
                  active
                  key={i}
                />
              );
            })}
          </div>
        ) : threads.length > 0 ? (
          <Segmented<Id>
            className="user--segment bg-blue-200"
            size="small"
            value={withUser ?? undefined}
            options={threads.map(function ({
              user_id,
              img_url,
              nick_name,
              user_type,
            }) {
              return {
                label: (
                  <UserCard
                    isMobile={isMobile}
                    imgUrl={img_url}
                    userType={user_type}
                    name={user_id === userId ? "ME" : nick_name}
                    active={withUser === user_id}
                  />
                ),
                value: user_id,
              };
            })}
            onChange={setWithUser}
          />
        ) : null}
      </div>
    </div>
  ) : (
    <div
      className={`bg-gray-100 h-full relative border-r ${
        isLoading ? "overflow-hidden" : "overflow-auto"
      } scroll--v scroll--v--chat bg-gray-200 border-gray-400`}
    >
      <div className="bg-white">
        {withUser !== null && !isLoading && (
          <div
            className="absolute w-full p-1"
            style={{
              height: `${String(element?.clientHeight ?? 0)}px`,
              top: `${String((element?.offsetHeight ?? 0) * selectedIndex)}px`,
              transition: "top 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)",
            }}
          >
            <div className="bg-gray-700 rounded-lg w-full h-full"></div>
          </div>
        )}
        {isLoading ? (
          <div className="flex flex-col w-60">
            {Array.from({ length: 40 }).map(function (_, i) {
              return (
                <Skeleton.Button
                  size="large"
                  className="w-full p-2 rounded"
                  active
                  key={i}
                />
              );
            })}
          </div>
        ) : (
          threads.map(function ({ user_id, nick_name, img_url, user_type }, i) {
            const active = withUser === user_id;
            return (
              <div
                className={`p-2 ${
                  active ? "" : "hover:bg-gray-100"
                } select-none flex gap-2 relative user--item cursor-pointer border-b border-gray-400`}
                key={user_id}
                ref={i === 0 ? setElement : undefined}
                onClick={function () {
                  setWithUser(user_id);
                }}
              >
                <UserCard
                  active={active}
                  isMobile={isMobile}
                  imgUrl={img_url}
                  userType={user_type}
                  name={user_id === userId ? "ME" : nick_name}
                />
                <div className="flex items-center border-l border-gray-400/80 pl-2 max-w-36">
                  <span
                    className={`truncate text-gray-500 ${
                      active ? "text-gray-100" : ""
                    }`}
                  >
                    welcome to live chatting {i + 1}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
