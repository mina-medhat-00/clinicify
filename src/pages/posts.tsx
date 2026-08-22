import {
  Alert,
  Button,
  Empty,
  Image,
  Input,
  message,
  Upload,
} from "@/components/ui/kit";
import { ImagePlus, MessageCircleQuestion, X } from "lucide-react";
import { useEffect, useState } from "react";
import PostWrapper from "@/components/post/post-wrapper";
import Loader from "@/components/ui/loader";
import ServerError from "@/components/ui/server-error";
import TableGrid from "@/components/ui/table-grid";
import TitleHeader from "@/components/ui/title-header";
import TransitionContent from "@/components/ui/transition-content";
import { CommentsContextProvider } from "@/contexts";
import { usePostsContext } from "@/contexts/posts-context";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";
import submitPost from "@/services/submit-post";

function getBase64(img?: any, setPostImg?: any, ..._args: any[]) {
  const reader = new FileReader();
  reader.addEventListener("load", function () {
    setPostImg(reader?.result);
  });
  reader.readAsDataURL(img);
}
function beforeUpload(file?: any, ..._args: any[]) {
  const isImg =
    file.type === "image/jpeg" ||
    file.type === "image/jpg" ||
    file.type === "image/png" ||
    file.type === "image/gif" ||
    file.type === "image/webp";
  if (!isImg) {
    message.error("You can only upload images!");
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("Image must smaller than 2MB!");
  }
  return isImg && isLt2M;
}
function Posts({ home }: any) {
  const { socket, isMobile } = useUtilsContext();
  const {
    fetchUserData,
    userData,
    messageApi,
    userData: userAuth,
  } = useUserContext();
  const { postsData, isLoading, isError, fetchPostsData } = usePostsContext();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState(null);
  const [postImg, setPostImg] = useState(null);
  const [showWarn, setShowWarn] = useState(false);
  const [showPost, setShowPost] = useState(false);
  useEffect(
    function () {
      setPosts(postsData || []);
    },
    [postsData],
  );
  useEffect(function () {
    function addPost(data?: any, ..._args: any[]) {
      const isUpdate = data?.updateEmoji;
      if (isUpdate) {
        const { post_id, like_emoji, dislike, angry } = data;
        setPosts(function (posts?: any, ..._args: any[]) {
          return posts?.map(function (post?: any, ..._args: any[]) {
            return post?.post_id == post_id
              ? {
                  ...post,
                  like_emoji: like_emoji || 0,
                  dislike: dislike || 0,
                  angry: angry || 0,
                }
              : post;
          });
        });
      } else
        setPosts(function (p?: any, ..._args: any[]) {
          return p?.some(function ({ post_id }: any) {
            return post_id == data?.post_id;
          })
            ? p
            : [data, ...p];
        });
    }
    socket?.on(`receive_post`, addPost);
    return function () {
      socket?.off("receive_post", addPost);
    };
  }, []);

  const allPosts = posts?.map(function (
    {
      user_id: userid,
      user_type: userType,
      post_img: postImg,
      img_url: imgUrl,
      nick_name: nickname,
      content,
      issued_time: issuedTime,
      num_comments: numComments,
      angry: numAngry,
      dislike: numDisLike,
      like_emoji: numLike,
      post_id: postId,
    }: any,
    i?: any,
  ) {
    return {
      is_img: !postImg,
      key: postId,
      element: (
        <div className={`grow text-white`} key={postId}>
          <CommentsContextProvider key={postId}>
            <PostWrapper
              order={postsData?.length - i}
              setPosts={setPosts}
              showPost={showPost}
              setShowPost={setShowPost}
              socket={socket}
              userid={userid}
              nickname={nickname}
              postImg={postImg}
              numAngry={numAngry}
              numLike={numLike}
              numDisLike={numDisLike}
              numComments={numComments}
              userType={userType}
              content={content}
              issuedTime={issuedTime}
              postId={postId}
              imgUrl={imgUrl}
            />
          </CommentsContextProvider>
        </div>
      ),
    };
  });
  const userid = userAuth?.user_id;
  return (
    <div className="mt-1 rounded-tr-lg rounded-tl-lg text-white font-medium">
      <div className="p-4">
        <div className="flex p-1 justify-center">
          <div className="border border-gray-200 shadow-md w-full p-4 bg-gray-300/30 rounded-lg sm:w-3/4 xl:w-1/2">
            <Input.TextArea
              placeholder={
                "Ask for any question, state your condition or medical issue"
              }
              className="rounded-lg border scroll--v border-gray-400 resize-none"
              value={content}
              rows={6}
              onChange={function (e?: any, ..._args: any[]) {
                setContent(e?.target?.value);
              }}
            />
            <div className="flex relative flex-wrap justify-between gap-2 items-center p-2">
              <Upload
                name="avatar"
                customRequest={function () {
                  return true;
                }}
                beforeUpload={beforeUpload}
                showUploadList={false}
                onChange={function (inf?: any, ..._args: any[]) {
                  if (inf?.file?.status)
                    getBase64(inf?.file?.originFileObj, setPostImg);
                }}
              >
                {postImg ? (
                  <div className="relative">
                    <Image
                      className="h-24 w-full rounded-xl select-none"
                      onClick={function (e?: any, ..._args: any[]) {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      src={postImg}
                    />
                    <div
                      onClick={function (e?: any, ..._args: any[]) {
                        setPostImg(null);
                        e.stopPropagation();
                      }}
                      className="text-2xl text-red-400/50 hover:text-red-400 absolute top-0 right-5"
                    >
                      <X className="size-6" />
                    </div>
                  </div>
                ) : (
                  <div>
                    <ImagePlus className="text-gray-700 size-8" />
                  </div>
                )}
              </Upload>
              <Button
                onClick={function () {
                  if (userid && content)
                    submitPost(
                      userData,
                      fetchUserData,
                      fetchPostsData,
                      messageApi,
                      content,
                      postImg,
                      setContent,
                      socket,
                    );
                  else setShowWarn(true);
                }}
                className="rounded-lg justify-center font-medium flex w-1/2 items-center border border-blue-600 text-white m-0
            py-4 bg-blue-700/80 hover:bg-blue-700
            "
              >
                {"Post"}
              </Button>
              {(!userid || !content) && showWarn && (
                <Alert
                  className="bg-red-500 rounded-md top-full absolute w-full"
                  closable={{
                    closeIcon: <X className="size-4 text-white" />,
                    onClose: function () {
                      setShowWarn(false);
                    },
                  }}
                  description={
                    <span className="text-white font-medium">
                      {!userid
                        ? "Please Sign up or login to use these features"
                        : "type any comment to submit"}
                    </span>
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <TitleHeader
        to={home ? "posts" : ""}
        wrapperBg={"no"}
        icon={
          <MessageCircleQuestion className="text-3xl sm:text-5xl xl:text-6xl m-auto text-white" />
        }
        title={home ? "Latest Questions" : "All Questions"}
      />
      <div className="pr-2">
        {posts?.length > 0 ? (
          <TransitionContent
            id="posts"
            speed="extraspeed"
            direction="bottomleft"
            parentClassName={`flex flex-wrap gap-2 ${
              home
                ? "max-h-96 overflow-auto trans--post scroll--v scroll--v--chat scroll--h"
                : ""
            } ${!isMobile ? "mx-8" : ""} items-start py-2 px-1`}
          >
            <TableGrid
              noMargin
              noGap
              colKey="post"
              isFull={
                allPosts?.filter(function ({ is_img }: any) {
                  return is_img;
                }) || []
              }
              customGrid={`${home ? "bg-white" : "bg-gray-100"}`}
              items={allPosts}
            />
          </TransitionContent>
        ) : isError ? (
          <ServerError errorTitle={"Posts"} />
        ) : isLoading || postsData?.length > 0 ? (
          <Loader />
        ) : (
          <Empty
            className={`${home ? "" : "mt-20"} w-full mb-4 font-medium`}
            description={
              <span
                className={`${
                  home
                    ? "text-white bg-blue-600/60 p-1 rounded"
                    : "text-gray-500"
                }`}
              >
                {"There are no posts"}
              </span>
            }
          />
        )}
      </div>
    </div>
  );
}

export default Posts;
