import { api, handleFailure, notify } from "@/services/client";
import type { ServiceContext } from "@/types/api";
import type { ProfileSection } from "@/types/services";
const labels: Record<ProfileSection, string> = {
  personal: "your information",
  medical: "your medical information",
  clinic: "clinic information",
};

// Personal and medical values go under values while clinic values go at the top level
export default async function submitProfile({
  section,
  values,
  isEdit,
  ...ctx
}: ServiceContext & {
  section: ProfileSection;
  values: Record<string, unknown>;
  isEdit?: boolean;
}) {
  const data =
    section === "clinic" ? { ...values, isEdit } : { values, isEdit };
  notify(ctx, "loading", `submitting ${labels[section]} ...`, 8);
  try {
    await api.post(`/submit/${section}`, { data });
    notify(ctx, "success", `${labels[section]} updated`, 2);
    return true;
  } catch (err) {
    handleFailure(
      err,
      ctx,
      `there's some issues cannot submit ${labels[section]} now`,
    );
    return false;
  }
}
