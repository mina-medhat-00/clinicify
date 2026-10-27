import {
  api,
  handleFailure,
  notify,
  type ServiceContext,
  type Socket,
} from "@/services/client";
import type { User } from "@/types";

// Timestamp for the copy broadcast over the socket, in the server's
// "YYYY-MM-DD HH:mm:ss" shape (UTC, two minutes ahead, as before).
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
  postId: string | number;
  commentId?: string | number | null;
  socket?: Socket;
}) {
  notify(ctx, "loading", "adding your comment ...", 8);
  try {
    const { data } = await api.post("/submit/comment", {
      data: { content, postId, commentId },
    });
    notify(ctx, "success", "thank you for your comment", 2);
    socket?.emit("send_comment", {
      reply_on: commentId,
      comment_id: data?.data?.comment_id,
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
