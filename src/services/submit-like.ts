import {
  api,
  handleFailure,
  type ServiceContext,
  type Socket,
} from "@/services/client";

export type LikeType = "like" | "dislike" | "angry";

export type LikeCounts = {
  like_type?: LikeType | null;
  like_emoji: number;
  dislike: number;
  angry: number;
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
  postId: string | number;
  commentId?: string | number | null;
  isComment?: boolean;
  socket?: Socket;
}): Promise<LikeCounts | null> {
  const isPost = !isComment;
  try {
    const { data } = await api.post("/submit/like", {
      data: { postId, commentId: commentId || null, likeType, isPost },
    });
    const result = data?.data ?? {};
    const counts: LikeCounts = {
      like_type: result.like_type,
      like_emoji: result.like_emoji || 0,
      dislike: result.dislike || 0,
      angry: result.angry || 0,
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
