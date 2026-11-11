import {
  api,
  errorData,
  errorStatus,
  handleFailure,
  notify,
} from "@/services/client";
import "@/types/user";
import { toQuery } from "@/utils/query";
import type { BookResult, BookParams } from "@/types/services";
import "@/types/api";

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
