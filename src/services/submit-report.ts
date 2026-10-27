import {
  api,
  handleFailure,
  notify,
  type ServiceContext,
} from "@/services/client";

export default async function submitReport({
  issue,
  reportType,
  ...ctx
}: ServiceContext & { issue: string; reportType: string }) {
  notify(ctx, "loading", "submitting your issue...", 8);
  try {
    await api.post("/submit/report", { data: { reportType, issue } });
    notify(ctx, "success", "Your issue sent to administrator, wait for answer");
    return true;
  } catch (err) {
    handleFailure(err, ctx);
    return false;
  }
}
