import { createContext, useCallback, useContext } from "react";
import { useRemoteData } from "@/contexts/use-remote-data";
import { useUserContext } from "@/contexts/user-context";
import { api } from "@/services/client";
import type { Appointment } from "@/types";
import { toQuery } from "@/utils/query";

export type AppointmentQuery = { date?: string; doctorId?: string | number };

const AppointmentData = createContext<any>(null);
export default function AppointmentContextProvider({
  children,
  isDoctor,
}: any) {
  const { handleSessionError } = useUserContext();
  const getAppointments = useCallback(
    async function (query?: AppointmentQuery) {
      const { data } = await api.get(
        `/get/appointments${toQuery({
          date: query?.date,
          doctor_id: query?.doctorId,
          doctor: isDoctor,
        })}`,
      );
      return data?.data as Appointment[];
    },
    [isDoctor],
  );
  const {
    data: appointmentData,
    setData: setAppointmentData,
    isLoading,
    load: fetchAppointmentData,
  } = useRemoteData(getAppointments, { requiresAuth: true });

  // Asks the API to move an appointment along (booked -> running -> done)
  // once its time comes; the reply is the refreshed list for that date.
  const updateAppointment = useCallback(
    async function (
      appointment: {
        doctorId?: string | number;
        patientId?: string | number;
        appointmentId?: string | number;
      },
      { date }: { date?: string },
    ) {
      try {
        const { data } = await api.post(
          `/update/appointment${toQuery({ doctor: isDoctor, date })}`,
          { data: appointment },
        );
        setAppointmentData(data?.data);
      } catch (err) {
        handleSessionError(err);
      }
    },
    [isDoctor, setAppointmentData, handleSessionError],
  );

  return (
    <AppointmentData.Provider
      value={{
        isLoading,
        appointmentData,
        fetchAppointmentData,
        updateAppointment,
        setAppointmentData,
      }}
    >
      {children}
    </AppointmentData.Provider>
  );
}

export function useAppointmentContext() {
  return useContext(AppointmentData);
}
