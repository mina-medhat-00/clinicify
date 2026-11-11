import { apiPost, handleFailure, notify } from "@/services/client";
import type { Id, User } from "@/types/user";
import type { ServiceContext, Socket } from "@/types/api";

// Socket copy timestamp as "YYYY-MM-DD HH:mm:ss" in UTC two minutes ahead
export function liveTimestamp() {
  return new Date(Date.now() + 2 * 60 * 1000)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
}

export default async function submitComment({
  user,
  content,
  postId,
  commentId,
  socket,
  ...ctx
}: ServiceContext & {
  user: User | null;
  content: string;
  postId: Id;
  commentId?: Id | null;
  socket?: Socket;
}) {
  notify(ctx, "loading", "adding your comment ...", 8);
  try {
    const data = await apiPost<{ comment_id?: Id } | null>("/submit/comment", {
      data: { content, postId, commentId },
    });
    notify(ctx, "success", "thank you for your comment", 2);
    socket?.emit("send_comment", {
      reply_on: commentId,
      comment_id: data?.comment_id,
      post_id: postId,
      user_id: user?.user_id,
      content,
      num_replies: 0,
      like_emoji: 0,
      dislike: 0,
      angry: 0,
      img_url: user?.img_url,
      nick_name: user?.nick_name,
      issued_time: liveTimestamp(),
    });
    return true;
  } catch (err) {
    handleFailure(
      err,
      ctx,
      "there's some issues cannot submit your comment now",
    );
    return false;
  }
}
