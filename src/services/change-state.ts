import {
  api,
  handleFailure,
  notify,
  type ServiceContext,
} from "@/services/client";

export type AccountAction = "verify" | "reject" | "delete" | "restrict";

type ChangeStateParams = ServiceContext & {
  action: AccountAction;
  target: "user" | "doctor";
  // The account to change; for "restrict" this is the chat to open/close.
  id?: string | number;
  chat?: {
    chat_from: string | number;
    chat_to: string | number;
    is_open: unknown;
  };
};

const progress: Record<AccountAction, string> = {
  verify: "Verifying",
  reject: "Rejecting",
  delete: "Deleting",
  restrict: "Restricting",
};
const done: Record<AccountAction, string> = {
  verify: "has been verified",
  reject: "has been rejected",
  delete: "has been deleted",
  restrict: "restricted",
};

export default async function changeState({
  action,
  target,
  id,
  chat,
  ...ctx
}: ChangeStateParams) {
  notify(ctx, "loading", `${progress[action]} ${target} account ...`, 8);
  const subject =
    action === "restrict"
      ? chat
      : target === "user"
        ? { userId: id }
        : { doctorId: id };
  try {
    await api.post(`/change/${target}`, { data: { type: action, ...subject } });
    notify(ctx, "success", `${target} account ${done[action]}`, 4);
    return true;
  } catch (err) {
    handleFailure(
      err,
      ctx,
      "there's some issues cannot submit your operation now",
    );
    return false;
  }
}
