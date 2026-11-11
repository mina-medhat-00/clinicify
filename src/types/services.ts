import type { ServiceContext, Socket } from "@/types/api";
import type { Id } from "@/types/user";
import type { Reactions, LikeType } from "@/types/content";

export type BookResult = "booked" | "unavailable" | "failed";

export type BookParams = ServiceContext & {
  date: string;
  slotTime: string;
  appointmentId: Id;
  doctorId: Id;
  check?: boolean;
  paymentIntentId?: string;
};

export type CancelParams = ServiceContext & {
  date: string;
  slotTime: string;
  appointmentId: Id;
  doctorId: Id;
  cancelFrom: "patient" | "doctor" | "admin";
  socket?: Socket;
};

export type AccountAction = "verify" | "reject" | "delete" | "restrict";

export type ChangeStateParams = ServiceContext & {
  action: AccountAction;
  target: "user" | "doctor";
  // Account to change or the chat to toggle for restrict
  id?: Id;
  chat?: {
    chat_from: Id;
    chat_to: Id;
    is_open: boolean;
  };
};

export type ScheduleParams = ServiceContext & {
  date: string;
  // Doctor whose schedule changes and the room to notify
  doctorId: Id;
  totalSlots?: unknown;
  addedAppointments?: unknown;
  deletedAppointments?: Id[];
  isEdit?: boolean;
  editSlot?: (Id | undefined)[];
  socket?: Socket;
};

export type LikeCounts = Reactions & {
  // Reaction after the toggle or null when removed
  like_type?: LikeType | null;
};

export type MessageResult = "sent" | "closed" | "failed";

export type ProfileSection = "personal" | "medical" | "clinic";
