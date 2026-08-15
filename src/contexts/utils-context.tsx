import { message } from "antd";
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import io from "socket.io-client";

const socket = io(`http://${window.location.hostname}:5000`);
const timeZone = " gmt+0300";
const UtilsData = createContext<any>(null);
const UtilsContextProvider = ({ children }: any) => {
  const { i18n, t } = useTranslation();
  const [lan, setLan] = useState(i18n.language || "en");
  const [messageApi, contextHolder] = message.useMessage();
  const isMobile = useMediaQuery({
    query: "(max-width:778px)",
  });
  const lang = i18n.language;
  useEffect(() => {
    setLan(lang);
  }, [lang]);
  return (
    <UtilsData.Provider
      value={{ timeZone, socket, isMobile, messageApi, lan, t, i18n }}
    >
      {contextHolder}
      {children}
    </UtilsData.Provider>
  );
};

export default UtilsContextProvider;

export const useUtilsContext = () => useContext(UtilsData);
