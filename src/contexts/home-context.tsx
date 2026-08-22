import axios from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
} from "react";
import { apiUrl } from "@/utils/api";

const HomeData = createContext<any>(null);
export default function HomeContextProvider({ children }: any) {
  const [isLoading, setIsLoading] = useState(true);
  const [homeData, setHomeData] = useState({});
  const fetchHomeData = useCallback(async function () {
    await Promise.resolve();
    setIsLoading(true);
    try {
      const { data } = await axios.request({
        url: apiUrl("/general/statistics"),
        ...{
          timeout: 10000,
        },
      });
      setHomeData(data?.data);
      setIsLoading(false);
      return data;
    } catch {
      setIsLoading(false);
    }
  }, []);
  useLayoutEffect(
    function () {
      const timeId = setTimeout(function () {
        fetchHomeData();
      });
      return function () {
        clearTimeout(timeId);
      };
    },
    [fetchHomeData],
  );
  return (
    <HomeData.Provider value={{ isLoading, homeData }}>
      {children}
    </HomeData.Provider>
  );
}

export function useHomeContext() {
  return useContext(HomeData);
}
