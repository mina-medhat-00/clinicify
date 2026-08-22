import axios from "axios";
import { createContext, useContext, useState } from "react";
import type { SlotsData } from "@/types";
import { apiUrl } from "@/utils/api";

const SlotsData = createContext<any>(null);
function SlotsContextProvider({ children }: any) {
  const [isLoading, setIsLoading] = useState(true);
  const [tokenExpired] = useState(false);
  const [slotsData, setSlotsData] = useState<SlotsData>({
    bookedSlots: null,
    totalSlots: null,
    freeSlots: null,
  });
  async function fetchSlotsData(
    postData?: any,
    noLoading?: any,
    ..._args: any[]
  ) {
    if (!noLoading) setIsLoading(true);
    try {
      const { data } = await axios.post(
        apiUrl("/get/slots"),
        {
          data: postData,
        },
        {
          timeout: 10000,
        },
      );
      setSlotsData(function () {
        return data?.data;
      });
      setIsLoading(false);
      return data;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  }

  return (
    <SlotsData.Provider
      value={{ isLoading, slotsData, fetchSlotsData, tokenExpired }}
    >
      {children}
    </SlotsData.Provider>
  );
}

export default SlotsContextProvider;

export function useSlotsContext() {
  return useContext(SlotsData);
}
