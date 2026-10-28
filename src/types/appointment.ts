import type { PatientRecords } from "@/types/clinic";
import type { Id, Verification } from "@/types/user";

export type AppointmentState =
  "free" | "booked" | "running" | "done" | "canceled";

export type AppointmentKind = "inClinic" | "chat" | "videoCall";

// GET /get/appointments. The doctor's list also carries the patient's records.
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

// One slot of a doctor's day (POST /get/slots).
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
