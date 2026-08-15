export type Post = {
  post_id?: string | number;
  user_id?: string | number;
  content?: string;
  issued_time?: string;
  issuedTime?: string;
  img_url?: string;
  is_img?: boolean | number;
  num_comments?: number;
  user_type?: string;
  nick_name?: string;
  [key: string]: any;
};

export type Comment = {
  comment_id?: string | number;
  post_id?: string | number;
  user_id?: string | number;
  content?: string;
  reply_on?: string | number | null;
  num_replies?: number;
  like_emoji?: number;
  dislike?: number;
  angry?: number;
  issued_time?: string;
  nick_name?: string;
  img_url?: string;
  [key: string]: any;
};

export type ChatThread = {
  user_id?: string | number;
  nick_name?: string;
  img_url?: string;
  user_type?: string;
  last_message?: string;
  [key: string]: any;
};

export type ChatMessage = {
  message_id?: string | number;
  user_id?: string | number;
  with_user?: string | number;
  content?: string;
  issued_date?: string;
  issued_time?: string;
  [key: string]: any;
};

export type Feedback = {
  feedback_id?: string | number;
  user_id?: string | number;
  doctor_id?: string | number;
  rate?: number;
  body?: string;
  content?: string;
  nick_name?: string;
  img_url?: string;
  [key: string]: any;
};

export type Report = {
  report_id?: string | number;
  user_id?: string | number;
  report_type?: string;
  report_cause?: string;
  issue?: string;
  nick_name?: string;
  [key: string]: any;
};
