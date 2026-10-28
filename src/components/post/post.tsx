import { Alert, Image } from "@/components/ui/display";
import { Button, Input } from "@/components/ui/controls";
import {
  Angry,
  CircleArrowDown,
  CircleArrowUp,
  Clock,
  Loader2,
  MessageCircle,
  MessageSquareX,
  Reply,
  Smile,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { Link } from "react-router-dom";
import type { Socket } from "socket.io-client";
import UserAvatar from "@/components/ui/user-avatar";
import {
  type CommentsQuery,
  useCommentsContext,
} from "@/contexts/comments-context";
import { useUserContext } from "@/contexts/user-context";
import { apiGet, type LoadOptions } from "@/services/client";
import submitComment from "@/services/submit-comment";
import submitLike, { type LikeType } from "@/services/submit-like";
import type {
  Comment,
  Like,
  Post as PostData,
  Reactions,
} from "@/types/content";
import type { Id } from "@/types/user";
import { toQuery } from "@/utils/query";

// The post or comment whose reply box is open. Post and comment ids are
// separate sequences, so the kind is part of the key.
export type ReplyTarget = `post:${string}` | `comment:${string}` | null;

function postTarget(postId: Id): ReplyTarget {
  return `post:${String(postId)}`;
}

function commentTarget(commentId: Id): ReplyTarget {
  return `comment:${String(commentId)}`;
}

// Live reaction counts sent over the socket.
export type ReactionUpdate = Reactions & {
  post_id: Id;
  comment_id?: Id | null;
  updateEmoji: true;
};

type SetComments = Dispatch<SetStateAction<Comment[] | null>>;
export type SetPosts = Dispatch<SetStateAction<PostData[]>>;
type FetchComments = (
  query: CommentsQuery,
  options?: LoadOptions,
) => Promise<unknown>;

function getLike(postId: Id, commentId?: Id) {
  return apiGet<Like | null>(`/get/like${toQuery({ postId, commentId })}`);
}

function CommentActions({
  isComment,
  postId,
  commentId,
  fetchCommentsData,
  setComments,
  show,
  setReply,
  numComments,
  showMore,
  lenViewedComments,
  isLoading,
  socket,
  setShowPost,
  showPost,
  numAngry,
  numDisLike,
  numLike,
  setPosts,
}: {
  isComment: boolean;
  postId: Id;
  commentId?: Id;
  fetchCommentsData: FetchComments;
  setComments: SetComments;
  // Offer to load more comments here.
  show: boolean;
  setReply: Dispatch<SetStateAction<ReplyTarget>>;
  numComments: number;
  showMore: boolean;
  lenViewedComments: number;
  isLoading: boolean;
  socket: Socket;
  setShowPost?: (postId: Id | null) => void;
  showPost?: Id | null;
  numAngry: number;
  numDisLike: number;
  numLike: number;
  setPosts?: SetPosts;
}) {
  const [likeData, setLikeData] = useState<{
    like_type?: LikeType | null;
  } | null>(null);
  const activeEmoji = likeData?.like_type;
  const { messageApi, fetchUserData, userData } = useUserContext();
  const signedIn = Boolean(userData);
  useEffect(
    function () {
      if (!signedIn) return;
      getLike(postId, commentId).then(setLikeData, function () {
        // Without the user's reaction the buttons just show no highlight.
      });
    },
    [signedIn, commentId, postId],
  );
  async function react(likeType: LikeType) {
    if (!userData) {
      messageApi.open({
        key: 1,
        type: "warning",
        content: "you need to login first",
        duration: 3,
      });
      return;
    }
    const counts = await submitLike({
      likeType,
      postId,
      commentId,
      isComment,
      socket,
      messageApi,
      fetchUserData,
    });
    if (!counts) return;
    setLikeData(counts);
    const { like_emoji, dislike, angry } = counts;
    // Show the new totals on this post or comment right away.
    if (isComment)
      setComments(function (comments) {
        return (
          comments?.map(function (c) {
            return c.comment_id === commentId
              ? { ...c, like_emoji, dislike, angry }
              : c;
          }) ?? null
        );
      });
    else
      setPosts?.(function (posts) {
        return posts.map(function (post) {
          return post.post_id === postId
            ? { ...post, like_emoji, dislike, angry }
            : post;
        });
      });
  }
  const emojiData: {
    type: LikeType;
    total: number;
    color: string;
    icon: ReactNode;
  }[] = [
    {
      type: "like",
      total: numLike,
      color: "text-blue-400",
      icon: (
        <ThumbsUp
          onClick={function () {
            void react("like");
          }}
          className={`flex cursor-pointer rounded-full items-center p-0.5 ${
            activeEmoji === "like"
              ? "fill-white bg-blue-800 shadow-md"
              : "fill-blue-400/80 hover:fill-blue-700/80 hover:shadow-lg"
          } text-2xl`}
        />
      ),
    },
    {
      type: "dislike",
      total: numDisLike,
      color: "text-yellow-400",
      icon: (
        <ThumbsDown
          fill="white"
          color="red"
          onClick={function () {
            void react("dislike");
          }}
          className={`flex cursor-pointer rounded-full items-center p-0.5 ${
            activeEmoji === "dislike"
              ? "fill-white bg-yellow-600 shadow-md"
              : "fill-yellow-400/80 hover:fill-yellow-700/80 hover:shadow-lg"
          } text-2xl`}
        />
      ),
    },
    {
      type: "angry",
      total: numAngry,
      color: "text-red-400",
      icon: (
        <Angry
          onClick={function () {
            void react("angry");
          }}
          className={`flex cursor-pointer rounded-full items-center p-0.5 ${
            activeEmoji === "angry"
              ? "fill-red-100 bg-red-600 shadow-md"
              : "fill-red-400/80 hover:shadow-lg hover:fill-red-700/80"
          } text-2xl`}
        />
      ),
    },
  ];
  const ownTarget =
    isComment && commentId !== undefined
      ? commentTarget(commentId)
      : postTarget(postId);
  function toggleReply() {
    setReply(function (current) {
      return current === ownTarget ? null : ownTarget;
    });
  }
  return (
    <div className="p-2">
      <div className="flex flex-wrap gap-1 justify-between items-center">
        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex flex-wrap gap-2 items-center bg-white p-2 rounded-lg shadow-sm">
            {emojiData.map(function ({ type, icon, total, color }) {
              return (
                <div key={type}>
                  {icon}
                  <span className={`${color} rounded-md p-1 z-20`}>
                    {total}
                  </span>
                </div>
              );
            })}
            <div className="p-1 flex flex-col gap-1 items-center shadow bg-blue-500/60 rounded-md">
              <MessageCircle /> {numComments}
            </div>
          </div>
        </div>
        {show && showMore && (
          <div
            onClick={function () {
              void fetchCommentsData({
                postId,
                limit: lenViewedComments + 5,
              });
              if (!isComment) setShowPost?.(postId);
            }}
            className="cursor-pointer p-2 rounded-lg hover:bg-gray-600 bg-gray-500 flex flex-wrap justify-center items-center gap-1"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <CircleArrowDown className="flex hover:shadow-lg cursor-pointer rounded-full hover:bg-gray-900 items-center text-gray-100 text-xl" />
            )}
            <span className="hidden sm:inline-block">
              Show {isComment ? "More Comments" : "Comments"}
            </span>
          </div>
        )}
        {!isComment ? (
          <div
            onClick={function () {
              setShowPost?.(postId);
              // Let the popup open before the reply box appears in it.
              if (showPost !== postId) setTimeout(toggleReply, 100);
              else toggleReply();
            }}
            className="cursor-pointer p-2 rounded-lg text-gray-700 hover:bg-gray-100 bg-white"
          >
            Comment
          </div>
        ) : (
          <Reply
            onClick={toggleReply}
            className="flex hover:shadow-lg cursor-pointer rounded-full hover:text-blue-700 items-center text-blue-600 text-xl"
          />
        )}
      </div>
    </div>
  );
}

function ReplyBox({
  isComment,
  setReply,
  postId,
  commentId,
  fetchCommentsData,
  socket,
  lenViewedComments,
  setLen,
}: {
  isComment: boolean;
  setReply: Dispatch<SetStateAction<ReplyTarget>>;
  postId: Id;
  commentId?: Id;
  fetchCommentsData: FetchComments;
  socket: Socket;
  lenViewedComments: number;
  setLen: Dispatch<SetStateAction<number>>;
}) {
  const { userData, messageApi, fetchUserData } = useUserContext();
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [content, setContent] = useState("");
  const [showWarn, setShowWarn] = useState(false);
  return (
    <div
      className={`z-20 ${
        isComment ? "pl-5 sm:pl-10 bg-gray-700" : "pl-5 sm:pl-10 bg-white"
      } mr-1 rounded-lg relative`}
    >
      <div
        className={`p-2 flex justify-between ${
          isComment ? "text-white" : "text-gray-700"
        } rounded`}
      >
        <div className="flex justify-left items-center gap-1">
          <UserAvatar src={userData?.img_url} userType={userData?.user_type} />
          {userData?.nick_name ?? "user"}
        </div>
        <div className="flex justify-center items-center">
          <MessageSquareX
            onClick={function () {
              setReply(null);
            }}
            className={`flex hover:shadow-lg cursor-pointer rounded-full hover:text-red-700 items-center ${
              isComment ? "text-gray-100" : "text-gray-700"
            } text-3xl`}
          />
        </div>
      </div>
      <div className="p-3 relative">
        <Input.TextArea
          className="rounded-xl h-20 sm:w-1/2"
          value={content}
          onChange={function (event) {
            setContent(event.target.value);
          }}
        />
        <div className="p-3 flex justify-between gap-2">
          <Button
            className="rounded-lg justify-center font-medium flex items-center border border-blue-600 text-white m-0 py-4 bg-blue-500/60 hover:bg-blue-400"
            onClick={function () {
              if (!userData || !content) {
                setShowWarn(true);
                return;
              }
              void submitComment({
                user: userData,
                content,
                postId,
                commentId,
                socket,
                messageApi,
                fetchUserData,
              }).then(function (sent) {
                if (!sent) return;
                // Load one more so the new comment shows up in the list.
                void fetchCommentsData(
                  { postId, limit: lenViewedComments + 1 },
                  { silent: true },
                );
                setLen(function (len) {
                  return len + 1;
                });
                setReply(null);
              });
            }}
          >
            send
          </Button>
          <div>
            <Smile
              onClick={function () {
                setEmojiOpen(function (open) {
                  return !open;
                });
              }}
              className={`flex cursor-pointer items-center text-3xl ${
                emojiOpen ? "text-blue-700" : "text-blue-400"
              }`}
            />
          </div>
        </div>
        {(!userData || !content) && showWarn && (
          <Alert
            className="bg-red-400 mt-2"
            closable={{
              closeIcon: <X className="size-4 text-white" />,
              onClose: function () {
                setShowWarn(false);
              },
            }}
            description={
              <span className="text-white font-medium">
                {!userData
                  ? "Please Sign up or login to use these features"
                  : "type any comment to submit"}
              </span>
            }
          />
        )}
      </div>
    </div>
  );
}

function CommentTemplate({
  comment,
  postId,
  makeComment,
  show,
  setComments,
  setMakeComment,
  fetchCommentsData,
  showMore,
  socket,
  lenViewedComments,
  isLoading,
  setLen,
}: {
  comment: Comment;
  postId: Id;
  makeComment: ReplyTarget;
  // The last comment offers to load more.
  show: boolean;
  setComments: SetComments;
  setMakeComment: Dispatch<SetStateAction<ReplyTarget>>;
  fetchCommentsData: FetchComments;
  showMore: boolean;
  socket: Socket;
  lenViewedComments: number;
  isLoading: boolean;
  setLen: Dispatch<SetStateAction<number>>;
}) {
  const {
    comment_id: commentId,
    user_id: userid,
    img_url: imgUrl,
    nick_name: nickname,
    content,
    issued_time: issuedTime,
    num_replies: numComments,
    angry: numAngry,
    dislike: numDisLike,
    like_emoji: numLike,
  } = comment;
  const replying = makeComment === commentTarget(commentId);
  return (
    <div
      className={`rounded-lg ${
        replying ? "relative" : ""
      } pl-5 sm:pl-10 bg-white pt-5 pb-2 ${show ? "" : "border-b-2"}`}
    >
      <div className="p-1 flex gap-1 flex-wrap justify-between mr-1 text-gray-700 rounded">
        <Link
          to={`/profile/${String(userid)}`}
          className="flex hover:text-gray-100 justify-left text-gray-700 items-center gap-2"
        >
          <UserAvatar src={imgUrl} />
          {nickname || "Message 1"}
        </Link>
        <div className="flex justify-left items-center gap-2">
          <span className="text-xs text-gray-700">
            {new Date(issuedTime).toLocaleString()}
          </span>
          <Clock className="flex hover:shadow-lg cursor-pointer hover:bg-gray-900 items-center text-gray-700 text-sm" />
        </div>
      </div>
      <div className="p-3 text-gray-600">{content || "Message 1"}</div>

      {replying && (
        <ReplyBox
          commentId={commentId}
          postId={postId}
          isComment
          setReply={setMakeComment}
          fetchCommentsData={fetchCommentsData}
          socket={socket}
          setLen={setLen}
          lenViewedComments={lenViewedComments}
        />
      )}
      <CommentActions
        show={show}
        isComment
        setReply={setMakeComment}
        setComments={setComments}
        fetchCommentsData={fetchCommentsData}
        postId={postId}
        numAngry={numAngry}
        numDisLike={numDisLike}
        numLike={numLike}
        commentId={commentId}
        showMore={showMore}
        numComments={numComments}
        lenViewedComments={lenViewedComments}
        isLoading={isLoading}
        socket={socket}
      />
    </div>
  );
}

export interface PostFields {
  postId: Id;
  userid: Id;
  imgUrl: string;
  nickname: string;
  numAngry: number;
  numLike: number;
  numDisLike: number;
  content: string;
  issuedTime: string;
  postImg: string | null;
}

function PostTemplate({
  userid,
  setPosts,
  postId,
  imgUrl,
  nickname,
  numAngry,
  numDisLike,
  numLike,
  numComments,
  showMore,
  content,
  setComments,
  comments,
  issuedTime,
  fetchCommentsData,
  makeComment,
  setMakeComment,
  show,
  postImg,
  socket,
  lenViewedComments,
  isLoading,
  setShowPost,
  showPost,
  setLen,
}: PostFields & {
  setPosts: SetPosts;
  numComments: number;
  showMore: boolean;
  setComments: SetComments;
  comments: Comment[];
  fetchCommentsData: FetchComments;
  makeComment: ReplyTarget;
  setMakeComment: Dispatch<SetStateAction<ReplyTarget>>;
  show: boolean;
  socket: Socket;
  lenViewedComments: number;
  isLoading: boolean;
  setShowPost: (postId: Id | null) => void;
  showPost: Id | null;
  setLen: Dispatch<SetStateAction<number>>;
}) {
  // Shows the full text once the popup has finished opening.
  const [showPopUp, setShowPopUp] = useState<Id | null>(null);
  useEffect(
    function () {
      if (showPost !== postId) return;
      const timeId = setTimeout(function () {
        setShowPopUp(postId);
      }, 400);
      return function () {
        clearTimeout(timeId);
      };
    },
    [showPost, postId],
  );
  const fullText = showPost === postId && showPopUp === postId;
  const replying = makeComment === postTarget(postId);
  return (
    <div
      className={`rounded-lg ${replying ? "relative" : ""} bg-gray-700 ${
        comments.length >= 1 ? "border-b-2 border-gray-100" : ""
      } top-0 left-0`}
    >
      <div className="p-1 flex gap-1 flex-wrap justify-between text-white rounded">
        <Link
          to={`/profile/${String(userid)}`}
          className="flex hover:text-gray-100 justify-left text-white items-center gap-2"
        >
          <UserAvatar src={imgUrl} />
          {nickname || "Message 1"}
        </Link>
        <div className="flex justify-left items-center gap-2">
          <span className="text-xs text-gray-300">
            {new Date(issuedTime).toLocaleString()}
          </span>
          <Clock className="flex hover:shadow-lg cursor-pointer hover:bg-gray-900 items-center text-gray-300 text-sm" />
        </div>
        {comments.length > 0 && (
          <div
            onClick={function () {
              setComments([]);
            }}
            className="cursor-pointer p-2 rounded-lg hover:bg-gray-600 bg-gray-500 flex text-white justify-center items-center gap-1"
          >
            <CircleArrowUp className="flex hover:shadow-lg cursor-pointer rounded-full hover:bg-gray-900 items-center text-gray-100 text-xl" />
            <span className="hidden sm:inline-block">Hide Comments</span>
          </div>
        )}
      </div>
      <div className="px-3 py-3 text-center text-base sm:text-lg text-gray-300">
        {!content ? (
          "Message"
        ) : fullText ? (
          content
        ) : (
          <>
            {content.slice(0, 300)}&nbsp;
            {content.length > 300 ? (
              <>
                ...{" "}
                <div
                  onClick={function () {
                    setShowPost(postId);
                  }}
                  className="inline-block p-2 mt-2 bg-gray-800 hover:bg-gray-700 shadow cursor-pointer text-white rounded"
                >
                  Show More
                </div>
              </>
            ) : null}
          </>
        )}
      </div>
      {postImg && (
        <div className="text-center w-full">
          <Image
            className="h-36 rounded-xl select-none"
            onClick={function (event) {
              event.stopPropagation();
              event.preventDefault();
            }}
            src={postImg}
          />
        </div>
      )}
      {replying && (
        <ReplyBox
          postId={postId}
          isComment={false}
          setReply={setMakeComment}
          fetchCommentsData={fetchCommentsData}
          socket={socket}
          setLen={setLen}
          lenViewedComments={lenViewedComments}
        />
      )}
      <CommentActions
        setPosts={setPosts}
        show={show}
        showPost={showPost}
        setShowPost={setShowPost}
        isComment={false}
        setReply={setMakeComment}
        setComments={setComments}
        numAngry={numAngry}
        numDisLike={numDisLike}
        numLike={numLike}
        fetchCommentsData={fetchCommentsData}
        postId={postId}
        showMore={showMore}
        numComments={numComments}
        lenViewedComments={lenViewedComments}
        isLoading={isLoading}
        socket={socket}
      />
    </div>
  );
}

export default function Post({
  socket,
  setShowPost,
  showPost,
  setPosts,
  setLen,
  setMakeComment,
  makeComment,
  showPopUp,
  numComments,
  ...post
}: PostFields & {
  socket: Socket;
  // The post shown in the popup, if any.
  setShowPost: (postId: Id | null) => void;
  showPost: Id | null;
  setPosts: SetPosts;
  numComments: number;
  setLen: Dispatch<SetStateAction<number>>;
  setMakeComment: Dispatch<SetStateAction<ReplyTarget>>;
  makeComment: ReplyTarget;
  // The post whose popup is open (stays set while it slides away).
  showPopUp: Id | null;
}) {
  const { postId } = post;
  const { isLoading, fetchCommentsData, commentsData, setCommentsData } =
    useCommentsContext();
  // Comments are only listed inside the open popup.
  const inPopUp = showPopUp === postId;
  const comments = inPopUp ? (commentsData ?? []) : [];
  useEffect(
    function () {
      if (showPost === postId) return;
      const timeId = setTimeout(function () {
        setCommentsData([]);
        setMakeComment(null);
      }, 400);
      return function () {
        clearTimeout(timeId);
      };
    },
    [showPost, postId, setCommentsData, setMakeComment],
  );
  useEffect(
    function () {
      function receiveComment(data: Comment | ReactionUpdate) {
        if ("updateEmoji" in data) {
          const { comment_id, like_emoji, dislike, angry } = data;
          setCommentsData(function (current) {
            return (
              current?.map(function (c) {
                return c.comment_id === comment_id
                  ? { ...c, like_emoji, dislike, angry }
                  : c;
              }) ?? null
            );
          });
          return;
        }
        if (
          commentsData?.some(function ({ comment_id }) {
            return comment_id === data.comment_id;
          })
        )
          return;
        setCommentsData(function (current) {
          if (!current?.length) return [data];
          // A reply also bumps its parent's reply count.
          return [
            data,
            ...current.map(function (c) {
              return c.comment_id === data.reply_on
                ? { ...c, num_replies: c.num_replies + 1 }
                : c;
            }),
          ];
        });
        setLen(function (len) {
          return len + 1;
        });
      }
      const event = `receive_comment_${String(postId)}`;
      socket.on(event, receiveComment);
      return function () {
        socket.off(event, receiveComment);
      };
    },
    [commentsData, postId, setCommentsData, setLen, socket],
  );
  return (
    <div className="p-2 grow w-full rounded-lg bg-gray-700">
      <div className="flex relative flex-col">
        <PostTemplate
          {...post}
          setPosts={setPosts}
          setShowPost={setShowPost}
          showPost={showPost}
          setLen={setLen}
          numComments={numComments}
          showMore={numComments > 0}
          setComments={setCommentsData}
          socket={socket}
          fetchCommentsData={fetchCommentsData}
          makeComment={makeComment}
          setMakeComment={setMakeComment}
          show={inPopUp ? !commentsData?.length : true}
          comments={comments}
          lenViewedComments={comments.length}
          isLoading={isLoading}
        />

        <div
          className={`flex flex-col rounded-lg p-1 max-h-96 sm:bg-gray-700 transition-all duration-500 ${
            commentsData?.length ? "" : "max-h-0 p-2"
          } overflow-auto gap-2 top-full w-full scroll--v scroll--v--comment`}
        >
          {comments.map(function (comment, i) {
            return (
              <CommentTemplate
                key={comment.comment_id}
                comment={comment}
                socket={socket}
                setLen={setLen}
                postId={postId}
                showMore={numComments > comments.length}
                fetchCommentsData={fetchCommentsData}
                setComments={setCommentsData}
                setMakeComment={setMakeComment}
                makeComment={makeComment}
                show={i === comments.length - 1}
                lenViewedComments={comments.length}
                isLoading={isLoading}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
