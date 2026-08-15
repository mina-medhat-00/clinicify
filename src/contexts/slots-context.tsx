import axios from "axios";
import { createContext, useState, useContext } from "react";

const SlotsData = createContext<any>(null);
const SlotsContextProvider = ({ children }: any) => {
  const [isLoading, setIsLoading] = useState(true);
  const [tokenExpired] = useState(false);
  const [slotsData, setSlotsData] = useState({
    bookedSlots: null,
    totalSlots: null,
    freeSlots: null,
  });
  const host = window?.location?.hostname;
  const fetchSlotsData = async (postData?: any, noLoading?: any, ..._args: any[]) => {
    if (!noLoading) setIsLoading(true);
    try {
      const { data } = await axios.post(
        `http://${host}:5000/get/slots`,
        {
          data: postData,
        },
        {
          timeout: 10000,
        },
      );
      setSlotsData(() => data?.data);
      setIsLoading(false);
      return data;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  return (
    <SlotsData.Provider
      value={{ isLoading, slotsData, fetchSlotsData, tokenExpired }}
    >
      {children}
    </SlotsData.Provider>
  );
};

export default SlotsContextProvider;

export const useSlotsContext = () => useContext(SlotsData);
