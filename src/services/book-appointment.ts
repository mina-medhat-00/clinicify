import {
  api,
  errorData,
  errorStatus,
  handleFailure,
  notify,
  type ServiceContext,
} from "@/services/client";
import type { Id } from "@/types/user";
import { toQuery } from "@/utils/query";

export type BookResult = "booked" | "unavailable" | "failed";

type BookParams = ServiceContext & {
  date: string;
  slotTime: string;
  appointmentId: Id;
  doctorId: Id;
  // Only checks the slot is still free (and emails the doctor), no booking.
  check?: boolean;
  // Stripe payment intent to capture once the slot is booked.
  paymentIntentId?: string;
};

export default async function bookAppointment({
  date,
  slotTime,
  appointmentId,
  doctorId,
  check,
  paymentIntentId,
  ...ctx
}: BookParams): Promise<BookResult> {
  try {
    await api.post(
      `/book/appointment${toQuery({ check, pi: paymentIntentId })}`,
      { data: { date, appointmentId, bookedSlot: slotTime, doctorId } },
    );
    return "booked";
  } catch (err) {
    const data = errorData(err);
    const isCanceled = Boolean(data?.isCanceled);
    if (errorStatus(err) === 400 && (isCanceled || Boolean(data?.isBooked))) {
      notify(
        ctx,
        "error",
        isCanceled
          ? "this slot has been canceled"
          : "this slot is already booked, try another slot",
        5,
      );
      return "unavailable";
    }
    handleFailure(
      err,
      ctx,
      errorStatus(err) === 400
        ? "cannot book this slot, please try again"
        : undefined,
    );
    return "failed";
  }
}
