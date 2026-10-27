import {
  api,
  handleFailure,
  notify,
  type ServiceContext,
} from "@/services/client";

export default async function submitFeedback({
  rate,
  feedback,
  doctorId,
  ...ctx
}: ServiceContext & {
  rate?: number;
  feedback?: string;
  doctorId: string | number;
}) {
  notify(ctx, "loading", "submitting your feedback ...", 8);
  try {
    const { data } = await api.post("/submit/feedback", {
      data: {
        rate: rate || 0,
        feedback: feedback || null,
        feedback_to: doctorId,
      },
    });
    notify(
      ctx,
      "success",
      data?.data?.update
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
