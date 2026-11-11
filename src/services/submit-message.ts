import { apiPost, errorStatus, handleFailure, notify } from "@/services/client";
import type { ChatMessage } from "@/types/content";
import type { Id } from "@/types/user";
import type { ServiceContext, Socket } from "@/types/api";
import type { MessageResult } from "@/types/services";
// Both users join one room named by their ids with the higher first
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
