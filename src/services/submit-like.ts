import {
  apiPost,
  handleFailure,
  type ServiceContext,
  type Socket,
} from "@/services/client";
import type { Id } from "@/types/user";
import type { LikeType, Reactions } from "@/types/content";

export type { LikeType };

export type LikeCounts = Reactions & {
  // The user's reaction after the toggle; null when it was removed.
  like_type?: LikeType | null;
};

// Toggles a reaction on a post or a comment, broadcasts the new
// counts, and returns them so the caller can update its list.
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
