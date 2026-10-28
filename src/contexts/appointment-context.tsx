import { useCallback, type ReactNode } from "react";
import { createStrictContext } from "@/utils/create-strict-context";
import { useRemoteData } from "@/hooks/use-remote-data";
import { useUserContext } from "@/contexts/user-context";
import { apiGet, apiPost } from "@/services/client";
import type { Appointment } from "@/types/appointment";
import type { Id } from "@/types/user";
import { toQuery } from "@/utils/query";

export interface AppointmentQuery {
  date?: string;
  doctorId?: Id;
}

function useAppointmentValue(isDoctor: boolean) {
  const { handleSessionError } = useUserContext();
  const getAppointments = useCallback(
    function (query: AppointmentQuery) {
      return apiGet<Appointment[]>(
        `/get/appointments${toQuery({
          date: query.date,
          doctor_id: query.doctorId,
          doctor: isDoctor,
        })}`,
      );
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
      appointment: { doctorId: Id; patientId: Id; appointmentId: Id },
      { date }: { date: string },
    ) {
      try {
        const data = await apiPost<Appointment[]>(
          `/update/appointment${toQuery({ doctor: isDoctor, date })}`,
          { data: appointment },
        );
        setAppointmentData(data);
      } catch (err) {
        handleSessionError(err);
      }
    },
    [isDoctor, setAppointmentData, handleSessionError],
  );

  return {
    isLoading,
    appointmentData,
    fetchAppointmentData,
    updateAppointment,
    setAppointmentData,
  };
}

const [AppointmentData, useAppointmentContext] =
  createStrictContext<ReturnType<typeof useAppointmentValue>>(
    "AppointmentContext",
  );
export { useAppointmentContext };

export default function AppointmentContextProvider({
  children,
  isDoctor = false,
}: {
  children: ReactNode;
  isDoctor?: boolean;
}) {
  const value = useAppointmentValue(isDoctor);
  return (
    <AppointmentData.Provider value={value}>
      {children}
    </AppointmentData.Provider>
  );
}
