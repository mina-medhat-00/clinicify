import axios from "axios";
import { createContext, useContext, useLayoutEffect, useState } from "react";
import { apiUrl } from "@/utils/api";

const HomeData = createContext<any>(null);
function HomeContextProvider({ children }: any) {
  const [isLoading, setIsLoading] = useState(true);
  const [homeData, setHomeData] = useState({});
  async function fetchHomeData() {
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
    } catch (err) {
      setIsLoading(false);
    }
  }
  useLayoutEffect(function () {
    fetchHomeData();
  }, []);
  return (
    <HomeData.Provider value={{ isLoading, homeData }}>
      {children}
    </HomeData.Provider>
  );
}

export default HomeContextProvider;

export function useHomeContext() {
  return useContext(HomeData);
}
