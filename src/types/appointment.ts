import type { PatientRecords } from "@/types/clinic";
import type { Id, Verification } from "@/types/user";

export type AppointmentState =
  "free" | "booked" | "running" | "done" | "canceled";

export type AppointmentKind = "inClinic" | "chat" | "videoCall";

export type Appointment = Partial<PatientRecords> & {
  appointmentId: Id;
  patientId: Id;
  doctorId: Id;
  schedule_date: string;
  booked_time: string;
  slot_time: string;
  appointment_state: AppointmentState;
  appointment_type: AppointmentKind;
  appointment_duration: number;
  appointmentFees?: number;
  fees: number;
  clinic_city?: string | null;
  clinic_street?: string | null;
  uimgUrl: string;
  dimgUrl: string;
  username: string;
  doctorName: string;
  rate: string;
  specialty: string;
  is_verified: Verification;
};

export interface Slot {
  appointmentId: Id;
  appointmentState: AppointmentState;
  appointmentType: AppointmentKind;
  appointmentFees: number;
  appointmentDuration: number;
  schedule_date: string;
  slotTime: string;
}

export interface SlotsData {
  totalSlots: Slot[];
  bookedSlots: Slot[];
  freeSlots: Slot[] | null;
  runningSlots: Slot[];
}

export interface CancelPrompt {
  show: boolean;
  slot: SlotRef | null;
}

export type StateFilter = AppointmentState | "total";

export interface AppointmentDetails {
  // Other person in the appointment
  withNickName: string;
  withId: Id;
  appointmentId: Id;
  appointment_state: AppointmentState;
  appointment_type: AppointmentKind;
}

export type Remaining =
  | { remainingTime: string; targetDate: Date; mode: "later" | "now" }
  | { remainingTime: null; targetDate: null; mode: null };

// Days from today with date as "YYYY-MM-DD"
export interface SelectedDay {
  count: number;
  date: string;
}

// Slot a cancel button refers to
export type SlotRef = Pick<Slot, "slotTime" | "appointmentId">;

// Slot as the API takes it with time as "hh:mm AM"
export interface SlotDraft {
  slotTime: string;
  appointmentDuration: number;
  appointmentFees: number | string;
  appointmentType?: AppointmentKind;
  appointmentId?: Id;
}

// Slot while edited with its time split up
export type BlockValues = Omit<SlotDraft, "slotTime"> & {
  slotTime: SlotTimeParts;
};

export type TimeMode = "AM" | "PM";

// Slot start on a 12-hour clock with AM/PM
export interface SlotTimeParts {
  h: number;
  m: number;
  timeMode: TimeMode;
}
