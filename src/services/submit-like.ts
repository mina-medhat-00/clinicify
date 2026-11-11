import { apiPost, handleFailure } from "@/services/client";
import type { Id } from "@/types/user";
import type { LikeType } from "@/types/content";
import type { ServiceContext, Socket } from "@/types/api";
import type { LikeCounts } from "@/types/services";

export type { LikeType };
// Toggle a reaction then broadcast and return the new counts
export default async function submitLike({
  likeType,
  postId,
  commentId,
  isComment,
  socket,
  ...ctx
}: ServiceContext & {
  likeType: LikeType;
  postId: Id;
  commentId?: Id | null;
  isComment?: boolean;
  socket?: Socket;
}): Promise<LikeCounts | null> {
  const isPost = !isComment;
  try {
    const data = await apiPost<Partial<LikeCounts> | null>("/submit/like", {
      data: { postId, commentId: commentId ?? null, likeType, isPost },
    });
    const counts: LikeCounts = {
      like_type: data?.like_type,
      like_emoji: data?.like_emoji ?? 0,
      dislike: data?.dislike ?? 0,
      angry: data?.angry ?? 0,
    };
    const { like_emoji, dislike, angry } = counts;
    if (isPost)
      socket?.emit("send_post", {
        post_id: postId,
        like_emoji,
        dislike,
        angry,
        updateEmoji: true,
      });
    else
      socket?.emit("send_comment", {
        post_id: postId,
        comment_id: commentId,
        like_emoji,
        dislike,
        angry,
        updateEmoji: true,
      });
    return counts;
  } catch (err) {
    handleFailure(
      err,
      ctx,
      "there's some issues cannot submit your reaction now",
    );
    return null;
  }
}
