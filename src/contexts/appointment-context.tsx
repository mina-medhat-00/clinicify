import axios from "axios";
import { createContext, useContext, useState } from "react";
import { useUserContext } from "@/contexts/user-context";
import type { Appointment } from "@/types";
import { apiUrl } from "@/utils/api";

const AppointmentData = createContext<any>(null);
function AppointmentContextProvider({ children, token, isDoctor }: any) {
  const { fetchUserData } = useUserContext();
  const [isLoading, setIsLoading] = useState(true);
  const [appointmentData, setAppointmentData] = useState<Appointment[] | null>(
    null,
  );
  async function fetchAppointmentData(
    active?: any,
    directToken?: any,
    done?: any,
    postData?: any,
    query?: any,
    noWaiting?: any,
  ) {
    if (!noWaiting) setIsLoading(true);
    if (!token && !active) {
      setAppointmentData(null);
      return setIsLoading(false);
    }
    try {
      if (done) {
        const { data } = await axios.post(
          apiUrl(
            `/update/appointment${
              isDoctor || query?.doctor
                ? `?doctor=true${query.date && `&date=${query.date}`}`
                : `?date=${query?.date}`
            }`,
          ),
          { data: postData },
          {
            headers: {
              Authorization: `Bearer ${active ? directToken : token}`,
            },
            timeout: 10000,
          },
        );
        setAppointmentData(data?.data);
        setIsLoading(false);
        return data;
      } else {
        const { data } = await axios.request({
          url: apiUrl(
            `/get/appointments?${
              query?.date ? `&date=${query?.date}` : ""
            }${query?.doctorId ? `&doctor_id=${query?.doctorId}` : ""}${
              isDoctor || query?.doctor ? `&doctor=true` : ""
            }`,
          ),
          ...{
            headers: {
              Authorization: `Bearer ${active ? directToken : token}`,
            },
            timeout: 10000,
          },
        });
        setAppointmentData(data?.data);
        setIsLoading(false);
      }
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
          setAppointmentData(null);
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
          setAppointmentData(null);
          break;
      }
      setIsLoading(false);
      throw err;
    }
  }

  return (
    <AppointmentData.Provider
      value={{
        isLoading,
        appointmentData,
        fetchAppointmentData,
        setAppointmentData,
      }}
    >
      {children}
    </AppointmentData.Provider>
  );
}

export default AppointmentContextProvider;

export function useAppointmentContext() {
  return useContext(AppointmentData);
}
