import axios from "axios";
import { createContext, useContext, useLayoutEffect, useState } from "react";
import Cookies from "universal-cookie";
import { useUserContext } from "@/contexts/user-context";
import type { Report } from "@/types";
import { apiUrl } from "@/utils/api";

const ReportData = createContext<any>(null);
export default function ReportContextProvider({ children, reportFrom }: any) {
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<Report[] | null>(null);
  const [isError, setIsError] = useState(false);
  const { fetchUserData } = useUserContext();
  async function fetchReportData(
    directToken?: any,
    notWaiting?: any,
    ..._args: any[]
  ) {
    if (!notWaiting) setIsLoading(true);
    setIsError(false);
    try {
      const { data } = await axios.request({
        url: apiUrl(
          `/get/${
            reportFrom ? `details/report?reportFrom=${reportFrom}` : "reports"
          }`,
        ),
        ...{
          headers: {
            Authorization: `Bearer ${directToken}`,
          },
          timeout: 10000,
        },
      });
      setReportData(data?.data);
      setIsLoading(false);
      return data;
    } catch (err) {
      const msg = err?.response?.data?.data?.name;
      switch (msg) {
        case "TokenExpiredError":
          fetchUserData(true, null, {
            response: {
              data: {
                data: {
                  name: "TokenExpiredError",
                },
              },
            },
          });
          break;
        case "JsonWebTokenError":
          fetchUserData(true, null, {
            response: {
              data: {
                data: {
                  name: "JsonWebTokenError",
                },
              },
            },
          });
          break;
        default:
          setIsError(true);
          break;
      }
      setIsLoading(false);
      throw err;
    }
  }
  useLayoutEffect(function () {
    fetchReportData(new Cookies().get("accessToken"));
  }, []);
  return (
    <ReportData.Provider
      value={{ isLoading, reportData, isError, fetchReportData }}
    >
      {children}
    </ReportData.Provider>
  );
}

export function useReportContext() {
  return useContext(ReportData);
}
