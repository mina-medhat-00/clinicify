import { Segmented, Skeleton } from "@/components/ui";
import { Home } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UserAvatar from "@/components/ui/user-avatar";

function UserCard({ imgUrl, name, isMobile, active, userType }: any) {
  return (
    <div className="p-1 text-center">
      <UserAvatar
        src={imgUrl}
        userType={userType}
        alt={name?.[0]?.toUpperCase()}
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
}: any) {
  const [element, setElement] = useState<any>(null);
  useEffect(
    function () {
      setElement(document?.getElementsByClassName("user--item")?.[0]);
    },
    [isMobile, chatData],
  );
  return isMobile ? (
    <div
      className={`wrapper shrink-0 flex gap-2 items-center bg-gray-600 p-2 h-20`}
    >
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
            {Array.from({ length: 10 }).map(function (
              _?: any,
              i?: any,
              ..._args: any[]
            ) {
              return (
                <Skeleton.Button
                  size={60 as any}
                  className="bg-gray-100/40 rounded"
                  active
                  key={i + 1}
                />
              );
            })}
          </div>
        ) : chatData?.length > 0 ? (
          <Segmented
            className="user--segment bg-blue-200"
            size="small"
            value={withUser}
            options={chatData?.map(function ({
              user_id,
              img_url,
              nick_name,
              user_type,
            }: any) {
              return {
                label: (
                  <UserCard
                    isMobile={isMobile}
                    imgUrl={img_url}
                    userType={user_type}
                    name={user_id === userId ? "ME" : nick_name}
                    active={withUser == user_id}
                  />
                ),
                value: user_id,
              };
            })}
            onChange={function (val?: any, ..._args: any[]) {
              setWithUser(val);
            }}
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
        {withUser && !isLoading && (
          <div className="absolute w-full p-1">
            <div className="bg-gray-700 rounded-lg w-full h-full"></div>
          </div>
        )}
        {isLoading ? (
          <div className="flex flex-col w-60">
            {Array.from({ length: 40 }).map(function (
              _?: any,
              i?: any,
              ..._args: any[]
            ) {
              return (
                <Skeleton.Button
                  size="large"
                  className="w-full p-2 rounded"
                  active
                  key={i + 1}
                />
              );
            })}
          </div>
        ) : (
          chatData?.map(function (
            { user_id, nick_name, img_url, user_type }: any,
            i?: any,
            ..._args: any[]
          ) {
            return (
              <div
                className={`p-2 ${
                  user_id !== withUser && "hover:bg-gray-100"
                } select-none flex gap-2 relative user--item cursor-pointer border-b border-gray-400`}
                key={user_id}
                onClick={function () {
                  setWithUser(user_id);
                }}
              >
                <UserCard
                  active={withUser == user_id}
                  isMobile={isMobile}
                  imgUrl={img_url}
                  userType={user_type}
                  name={user_id === userId ? "ME" : nick_name}
                />
                <div className="flex items-center border-l border-gray-400/80 pl-2 max-w-36">
                  <span
                    className={`truncate text-gray-500 ${
                      withUser == user_id && "text-gray-100"
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
