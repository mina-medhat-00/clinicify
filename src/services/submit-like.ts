import axios from "axios";
import Cookies from "universal-cookie";
import { apiUrl } from "@/utils/api";

const cookies = new Cookies();
export default async function submitLike(
  user?: any,
  fetchUserData?: any,
  fetchCommentsData?: any,
  messageApi?: any,
  likeType?: any,
  postId?: any,
  commentId?: any,
  isPost?: any,
  lenViewedComments?: any,
  getLike?: any,
  setLikeData?: any,
  socket?: any,
  setPosts?: any,
  setComments?: any,
) {
  const data = { postId, commentId: commentId || null, likeType, isPost };
  axios
    .post(
      apiUrl("/submit/like"),
      {
        data,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies?.get("accessToken")}`,
        },
      },
    )
    .then(function (res?: any, ..._args: any[]) {
      setLikeData(res?.data?.data);
      const { like_emoji, dislike, angry } = res?.data?.data ?? {};
      if (!isPost) {
        socket?.emit("send_comment", {
          post_id: postId,
          comment_id: commentId,
          like_emoji,
          dislike,
          angry,
          updateEmoji: true,
        });
        setComments(function (comments?: any, ..._args: any[]) {
          return comments?.map(function (c?: any, ..._args: any[]) {
            return c?.comment_id == commentId
              ? {
                  ...c,
                  like_emoji: like_emoji || 0,
                  dislike: dislike || 0,
                  angry: angry || 0,
                }
              : c;
          });
        });
      } else {
        socket?.emit("send_post", {
          post_id: postId,
          like_emoji,
          dislike,
          angry,
          updateEmoji: true,
        });
        setPosts(function (posts?: any, ..._args: any[]) {
          return posts?.map(function (post?: any, ..._args: any[]) {
            return post?.post_id == postId
              ? {
                  ...post,
                  like_emoji: like_emoji || 0,
                  dislike: dislike || 0,
                  angry: angry || 0,
                }
              : post;
          });
        });
      }
    })
    .catch(function (err?: any, ..._args: any[]) {
      if (err?.response?.status == 401) {
        fetchUserData(true, cookies.get("accessToken"));
      } else
        messageApi.open({
          key: 1,
          content: "there's some issues cannot submit your comment now",
          type: "error",
          duration: 2,
        });
    });
}
