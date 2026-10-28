import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import Post, {
  type PostFields,
  type ReplyTarget,
  type SetPosts,
} from "@/components/post/post";
import PopUp from "@/components/ui/pop-up";
import type { Id } from "@/types/user";

// A post in the list; while it is the open one it moves into a popup.
export default function PostWrapper({
  setPosts,
  showPost,
  setShowPost,
  socket,
  numComments,
  ...post
}: PostFields & {
  setPosts: SetPosts;
  showPost: Id | null;
  setShowPost: (postId: Id | null) => void;
  socket: Socket;
  numComments: number;
}) {
  const { postId } = post;
  // Stays set while the popup slides away.
  const [showPopUp, setShowPopUp] = useState<Id | null>(null);
  const [len, setLen] = useState(numComments);
  const [prevNumComments, setPrevNumComments] = useState(numComments);
  if (numComments !== prevNumComments) {
    setPrevNumComments(numComments);
    setLen(numComments);
  }
  const [makeComment, setMakeComment] = useState<ReplyTarget>(null);
  if (showPost !== null && showPopUp !== showPost) setShowPopUp(showPost);
  useEffect(
    function () {
      if (showPost !== null) return;
      const timeId = setTimeout(function () {
        setShowPopUp(null);
      }, 400);
      return function () {
        clearTimeout(timeId);
      };
    },
    [showPost],
  );
  const content = (
    <Post
      {...post}
      showPopUp={showPopUp}
      setMakeComment={setMakeComment}
      setLen={setLen}
      makeComment={makeComment}
      setPosts={setPosts}
      showPost={showPost}
      setShowPost={setShowPost}
      socket={socket}
      numComments={len}
    />
  );
  return showPopUp === postId ? (
    <PopUp
      customWidth="w-full bottom-2 md:w-3/4"
      mt="10px"
      show={showPost}
      handleClose={function () {
        setShowPost(null);
      }}
    >
      {content}
    </PopUp>
  ) : (
    content
  );
}
