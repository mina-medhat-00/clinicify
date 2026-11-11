import type { Id, UserType } from "@/types/user";
import type { ReactNode, Dispatch, SetStateAction } from "react";
import type { CommentsQuery } from "@/types/queries";
import type { LoadOptions } from "@/types/api";

export interface Reactions {
  like_emoji: number;
  dislike: number;
  angry: number;
}

export type LikeType = "like" | "dislike" | "angry";

// GET /get/posts
export type Post = Reactions & {
  post_id: Id;
  user_id: Id;
  content: string;
  issued_time: string;
  post_img: string | null;
  nick_name: string;
  img_url: string;
  num_comments: number;
};

// GET /get/comments
export type Comment = Reactions & {
  comment_id: Id;
  post_id: Id;
  user_id: Id;
  reply_on: Id | null;
  content: string;
  issued_time: string;
  num_replies: number;
  nick_name: string;
  img_url: string;
};

// GET /get/like returns the signed-in user's reaction
export interface Like {
  like_type: LikeType;
}

// GET /get/chat returns one conversation partner
export interface ChatThread {
  chat_from: Id;
  chat_to: Id;
  user_id: Id;
  user_name: string;
  nick_name: string;
  img_url: string;
  user_type: UserType;
  specialty: string | null;
  is_open: number;
  rate: number;
}

// GET /get/messages
export interface ChatMessage {
  message_id?: Id;
  message_from: Id;
  message_to: Id;
  content: string;
  issued_date: string;
  issued_time: string;
}

// GET /get/feedback
export interface Feedback {
  feedback_from: Id;
  feedback_to: Id;
  rate: number;
  issued_time: string;
  feedback: string;
  uimgUrl: string;
  dimgUrl: string;
  username: string;
  doctorName: string;
}

// GET /get/reports returns one row per reporting user
export interface ReportSummary {
  report_from: Id;
  num_reports: number;
  latest_report_time: string;
  user_id: Id;
  user_name: string;
  img_url: string;
  nick_name: string;
  user_type: UserType;
}

// GET /get/details/report
export interface Report {
  report_id: Id;
  issue: string;
  report_type: string;
  issued_time: string;
}

// GET /general/statistics
export interface HomeStatistics {
  totalAppointments: number;
  avgRate: number;
  avgFees: number;
  totalDoctors: number;
  totalReviews: number;
}

export interface DoctorStatistics {
  totalAppointments: number;
  free: number;
  booked: number;
  done: number;
  canceled: number;
  avgRate: number;
  totalReviews: number;
}

// GET /dashboard
export interface Dashboard {
  is_verified: 0 | 1 | null;
  statistics?: DoctorStatistics;
}

export interface HomeStat {
  // "2" draws a thicker separator above the tile
  borderLine: "1" | "2";
  // "no" keeps the separator on wide screens too
  noLine: "no" | "sm";
  title: string;
  value: number | undefined;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export interface ReportValues {
  issue: string;
  reportType: string;
}

// Open reply box keyed by kind since post and comment ids overlap
export type ReplyTarget = `post:${string}` | `comment:${string}` | null;

// Live reaction counts sent over the socket
export type ReactionUpdate = Reactions & {
  post_id: Id;
  comment_id?: Id | null;
  updateEmoji: true;
};

export type SetComments = Dispatch<SetStateAction<Comment[] | null>>;

export type SetPosts = Dispatch<SetStateAction<Post[]>>;

export type FetchComments = (
  query: CommentsQuery,
  options?: LoadOptions,
) => Promise<unknown>;

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
