import type { Id } from "@/types/user";
import type { ReportSummary, Report } from "@/types/content";

export interface AppointmentQuery {
  date?: string;
  doctorId?: Id;
}

// chat_to also returns that user's chat and userid lets admins list another user's chats
export interface ChatQuery {
  chat_to?: Id | null;
  userid?: Id;
}

export interface CommentsQuery {
  postId: Id;
  limit?: number;
}

export interface DoctorsQuery {
  // Include unverified doctors for admins
  total?: boolean;
  limit?: number;
  specialty?: string;
  dname?: string;
  location?: string;
}

export interface FeedbackQuery {
  username?: string;
  limit?: number;
}

export interface MessagesQuery {
  message_to: Id;
}

export interface PostsQuery {
  limit?: number;
}

// Summary rows per reporting user or that user's reports when reportFrom is set
export type ReportsResult =
  | { kind: "summaries"; rows: ReportSummary[] }
  | { kind: "reports"; rows: Report[] };

export interface SlotsQuery {
  date: string;
  doctorId: Id;
}
