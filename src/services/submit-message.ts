import {
  apiPost,
  errorStatus,
  handleFailure,
  notify,
  type ServiceContext,
  type Socket,
} from "@/services/client";
import type { ChatMessage } from "@/types/content";
import type { Id } from "@/types/user";

export type MessageResult = "sent" | "closed" | "failed";

// Both users join the same room, named "<higher id>,<lower id>".
export function chatRoomId(a: Id, b: Id) {
  return a > b ? `${String(a)},${String(b)}` : `${String(b)},${String(a)}`;
}

export default async function submitMessage({
  content,
  messageTo,
  userId,
  isFirst,
  socket,
  ...ctx
}: ServiceContext & {
  content: string;
  messageTo: Id;
  userId: Id;
  isFirst?: boolean;
  socket?: Socket;
}): Promise<MessageResult> {
  try {
    const data = await apiPost<Partial<
      Pick<ChatMessage, "message_id" | "issued_date" | "issued_time">
    > | null>("/submit/message", {
      data: { content, message_to: messageTo, isFirst },
    });
    if (isFirst) socket?.emit("add_chat", messageTo);
    socket?.emit("send_message", {
      message_id: data?.message_id,
      content,
      chatId: chatRoomId(messageTo, userId),
      message_to: messageTo,
      message_from: userId,
      issued_date: data?.issued_date,
      issued_time: data?.issued_time,
    });
    return "sent";
  } catch (err) {
    if (errorStatus(err) === 403) {
      notify(ctx, "warning", "we're sorry but your chat is closed now", 2);
      return "closed";
    }
    handleFailure(err, ctx, "there's some issues cannot send your message now");
    return "failed";
  }
}
