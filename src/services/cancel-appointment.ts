import {
  api,
  errorStatus,
  handleFailure,
  notify,
  type ServiceContext,
  type Socket,
} from "@/services/client";
import type { Id } from "@/types/user";

type CancelParams = ServiceContext & {
  date: string;
  slotTime: string;
  appointmentId: Id;
  doctorId: Id;
  cancelFrom: "patient" | "doctor" | "admin";
  socket?: Socket;
};

export default async function cancelAppointment({
  date,
  slotTime,
  appointmentId,
  doctorId,
  cancelFrom,
  socket,
  ...ctx
}: CancelParams) {
  notify(ctx, "loading", "cancel your appointment...", 8);
  try {
    await api.post("/cancel/appointment", {
      data: { date, bookedSlot: slotTime, doctorId, cancelFrom, appointmentId },
    });
    notify(ctx, "success", "Your Appointment Canceled");
    socket?.emit("update_appointments", { date, doctorId });
    return true;
  } catch (err) {
    if (errorStatus(err) === 400)
      notify(
        ctx,
        "error",
        "it's already canceled or there's missing information",
      );
    else handleFailure(err, ctx);
    return false;
  }
}
