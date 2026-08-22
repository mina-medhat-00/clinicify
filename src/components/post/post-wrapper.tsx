import { useEffect, useState } from "react";
import Post from "@/components/post/post";
import PopUp from "@/components/ui/pop-up";

export default function PostWrapper({
  setPosts,
  showPost,
  setShowPost,
  socket,
  order,
  userid,
  nickname,
  postImg,
  numAngry,
  numLike,
  numDisLike,
  numComments,
  userType,
  content,
  issuedTime,
  postId,
  imgUrl,
}: any) {
  const [showPopUp, setShowPopUp] = useState(false);
  const [len, setLen] = useState(numComments || 0);
  const [prevNumComments, setPrevNumComments] = useState(numComments);
  if (numComments !== prevNumComments) {
    setPrevNumComments(numComments);
    setLen(numComments);
  }
  const [makeComment, setMakeComment] = useState(null);
  if (showPost && showPopUp !== showPost) setShowPopUp(showPost);
  useEffect(
    function () {
      if (showPost) return;
      const timeId = setTimeout(function () {
        setShowPopUp(false);
      }, 400);
      return function () {
        clearTimeout(timeId);
      };
    },
    [showPost],
  );
  return showPopUp == postId ? (
    <PopUp
      customWidth={"w-full bottom-2 md:w-3/4"}
      mt={"10px"}
      show={showPost}
      handleClose={function () {
        setShowPost(null);
      }}
    >
      {
        <Post
          showPopUp={showPopUp}
          setMakeComment={setMakeComment}
          setLen={setLen}
          makeComment={makeComment}
          setPosts={setPosts}
          showPost={showPost}
          setShowPost={setShowPost}
          socket={socket}
          order={order}
          userid={userid}
          nickname={nickname}
          postImg={postImg}
          numAngry={numAngry}
          numLike={numLike}
          numDisLike={numDisLike}
          numComments={len}
          userType={userType}
          content={content}
          issuedTime={issuedTime}
          postId={postId}
          imgUrl={imgUrl}
        />
      }
    </PopUp>
  ) : (
    <Post
      showPopUp={showPopUp}
      setMakeComment={setMakeComment}
      setLen={setLen}
      makeComment={makeComment}
      setPosts={setPosts}
      showPost={showPost}
      setShowPost={setShowPost}
      socket={socket}
      order={order}
      userid={userid}
      nickname={nickname}
      postImg={postImg}
      numAngry={numAngry}
      numLike={numLike}
      numDisLike={numDisLike}
      numComments={len}
      userType={userType}
      content={content}
      issuedTime={issuedTime}
      postId={postId}
      imgUrl={imgUrl}
    />
  );
}
