import axios from "axios";
import Cookies from "universal-cookie";
import { apiUrl } from "@/utils/api";

const cookies = new Cookies();
const submitPost = async (
  user?: any,
  fetchUserData?: any,
  fetchPostsData?: any,
  messageApi?: any,
  content?: any,
  postImg?: any,
  setContent?: any,
  socket?: any,
) => {
  const data = { content, postImg };
  messageApi.open({
    key: 1,
    content: "posting your question ...",
    type: "loading",
    duration: 8,
  });
  axios
    .post(
      apiUrl("/submit/post"),
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
      messageApi.open({
        key: 1,
        content: "thank you for your question ❤",
        type: "success",
        duration: 2,
      });
      setContent("");
      socket?.emit("send_post", {
        user_id: user?.user_id,
        post_img: postImg,
        img_url: user?.img_url,
        nick_name: user?.nick_name,
        content,
        issued_time: new Date(new Date().getTime() + 2 * 60 * 1000)
          .toISOString()
          .slice(0, 19)
          .replace("T", " "),
        num_comments: 0,
        angry: 0,
        dislike: 0,
        like_emoji: 0,
        post_id: res?.data?.data?.post_id,
      });
      fetchPostsData(null, true);
    })
    .catch((err?: any, ..._args: any[]) => {
      if (err?.response?.status == 401) {
        fetchUserData(true, cookies.get("accessToken"));
      } else
        messageApi.open({
          key: 1,
          content: "there's some issues cannot submit your question now",
          type: "error",
          duration: 2,
        });
    });
};

export default submitPost;
