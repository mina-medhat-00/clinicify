import {
  apiPost,
  handleFailure,
  notify,
  type ServiceContext,
  type Socket,
} from "@/services/client";
import { liveTimestamp } from "@/services/submit-comment";
import type { Id, User } from "@/types/user";

export default async function submitPost({
  user,
  content,
  postImg,
  socket,
  ...ctx
}: ServiceContext & {
  user: User | null;
  content: string;
  postImg?: string | null;
  socket?: Socket;
}) {
  notify(ctx, "loading", "posting your question ...", 8);
  try {
    const data = await apiPost<{ post_id?: Id } | null>("/submit/post", {
      data: { content, postImg },
    });
    notify(ctx, "success", "thank you for your question", 2);
    socket?.emit("send_post", {
      user_id: user?.user_id,
      post_img: postImg,
      img_url: user?.img_url,
      nick_name: user?.nick_name,
      content,
      issued_time: liveTimestamp(),
      num_comments: 0,
      angry: 0,
      dislike: 0,
      like_emoji: 0,
      post_id: data?.post_id,
    });
    return true;
  } catch (err) {
    handleFailure(
      err,
      ctx,
      "there's some issues cannot submit your question now",
    );
    return false;
  }
}
