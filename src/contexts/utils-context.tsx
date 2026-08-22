import { message } from "@/components/ui/kit";
import { createContext, useContext } from "react";
import { useMediaQuery } from "react-responsive";
import io from "socket.io-client";
import { apiOrigin } from "@/utils/api";

const socket = io(apiOrigin);
const timeZone = " gmt+0300";
const UtilsData = createContext<any>(null);
function UtilsContextProvider({ children }: any) {
  const [messageApi, contextHolder] = message.useMessage();
  const isMobile = useMediaQuery({
    query: "(max-width:778px)",
  });
  return (
    <UtilsData.Provider value={{ timeZone, socket, isMobile, messageApi }}>
      {contextHolder}
      {children}
    </UtilsData.Provider>
  );
}

export default UtilsContextProvider;

export function useUtilsContext() {
  return useContext(UtilsData);
}
