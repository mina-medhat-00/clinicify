import { message } from "@/components/ui/message";
import type { ReactNode } from "react";
import { useMediaQuery } from "react-responsive";
import io from "socket.io-client";
import { createStrictContext } from "@/utils/create-strict-context";
import { apiOrigin } from "@/utils/api";

const socket = io(apiOrigin);
const timeZone = " gmt+0300";

function useUtilsValue() {
  const [messageApi, contextHolder] = message.useMessage();
  const isMobile = useMediaQuery({
    query: "(max-width:778px)",
  });
  return { value: { timeZone, socket, isMobile, messageApi }, contextHolder };
}

const [UtilsData, useUtilsContext] =
  createStrictContext<ReturnType<typeof useUtilsValue>["value"]>(
    "UtilsContext",
  );
export { useUtilsContext };

export default function UtilsContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { value, contextHolder } = useUtilsValue();
  return (
    <UtilsData.Provider value={value}>
      {contextHolder}
      {children}
    </UtilsData.Provider>
  );
}
