import {
  apiPost,
  handleFailure,
  notify,
  type ServiceContext,
} from "@/services/client";
import type { Id } from "@/types/user";

export default async function submitFeedback({
  rate,
  feedback,
  doctorId,
  ...ctx
}: ServiceContext & {
  rate?: number;
  feedback?: string;
  doctorId: Id;
}) {
  notify(ctx, "loading", "submitting your feedback ...", 8);
  try {
    const data = await apiPost<{ update?: boolean } | null>(
      "/submit/feedback",
      {
        data: {
          rate: rate ?? 0,
          // An empty review is sent as no review.
          feedback: feedback?.trim() ? feedback : null,
          feedback_to: doctorId,
        },
      },
    );
    notify(
      ctx,
      "success",
      data?.update
        ? "thank you for your feedback update"
        : "thank you for your feedback",
      2,
    );
    return true;
  } catch (err) {
    handleFailure(
      err,
      ctx,
      "there's some issues cannot submit your feedback now",
    );
    return false;
  }
}
