import type { Id, UserType } from "@/types/user";

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

// GET /get/comments. A reply has `reply_on` set to its parent comment.
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

// GET /get/like: the signed-in user's reaction, if any.
export interface Like {
  like_type: LikeType;
}

// GET /get/chat: one conversation partner.
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

// GET /get/reports: one row per user who reported something.
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
