import Cookies from "universal-cookie";
import axios from "axios";
const cookies = new Cookies();
const submitLike = async (
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
) => {
  const data = { postId, commentId: commentId || null, likeType, isPost };
  const host = window?.location?.hostname;
  axios
    .post(
      `http://${host}:5000/submit/like`,
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
    .then((res?: any, ..._args: any[]) => {
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
        setComments((comments?: any, ..._args: any[]) =>
          comments?.map((c?: any, ..._args: any[]) =>
            c?.comment_id == commentId
              ? {
                  ...c,
                  like_emoji: like_emoji || 0,
                  dislike: dislike || 0,
                  angry: angry || 0,
                }
              : c,
          ),
        );
      } else {
        socket?.emit("send_post", {
          post_id: postId,
          like_emoji,
          dislike,
          angry,
          updateEmoji: true,
        });
        setPosts((posts?: any, ..._args: any[]) =>
          posts?.map((post?: any, ..._args: any[]) =>
            post?.post_id == postId
              ? {
                  ...post,
                  like_emoji: like_emoji || 0,
                  dislike: dislike || 0,
                  angry: angry || 0,
                }
              : post,
          ),
        );
      }
    })
    .catch((err?: any, ..._args: any[]) => {
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
};

export default submitLike;
