import {
  api,
  errorData,
  errorStatus,
  handleFailure,
  notify,
  type ServiceContext,
  type Socket,
} from "@/services/client";
import type { Id } from "@/types/user";

type ScheduleParams = ServiceContext & {
  date: string;
  // The doctor whose schedule changes (also the room to notify).
  doctorId: Id;
  totalSlots?: unknown;
  addedAppointments?: unknown;
  deletedAppointments?: Id[];
  isEdit?: boolean;
  editSlot?: (Id | undefined)[];
  socket?: Socket;
};

export default async function scheduleAppointments({
  date,
  doctorId,
  totalSlots,
  addedAppointments,
  deletedAppointments,
  isEdit,
  editSlot,
  socket,
  ...ctx
}: ScheduleParams) {
  const verb = deletedAppointments ? "delet" : isEdit ? "edit" : "schedul";
  notify(ctx, "loading", `${verb}ing your appointments ...`, 8);
  try {
    await api.post(isEdit ? "/edit/appointment" : "/schedule/appointments", {
      data: {
        date,
        totalSlots,
        deletedAppointments,
        addedAppointments,
        editSlot,
        doctorId,
      },
    });
    notify(ctx, "success", `your appointments ${verb}ed successfully`);
    socket?.emit("update_appointments", { date, doctorId });
    return true;
  } catch (err) {
    const timeSlots = errorData(err)?.timeSlots;
    if (errorStatus(err) === 400 && Array.isArray(timeSlots))
      notify(
        ctx,
        "error",
        `there's slot${timeSlots.length > 1 ? "s" : ""} booked in ${timeSlots.join(" | ")}`,
      );
    else handleFailure(err, ctx);
    return false;
  }
}
