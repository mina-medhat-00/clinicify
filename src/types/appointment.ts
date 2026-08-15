export type AppointmentState =
  "free" | "booked" | "running" | "done" | "canceled" | string;

export type AppointmentKind = "inClinic" | "chat" | "videoChat" | string;

export type Appointment = {
  appointment_id?: string | number;
  appointmentId?: string | number;
  appointment_state?: AppointmentState;
  appointmentState?: AppointmentState;
  appointment_type?: AppointmentKind;
  appointmentType?: AppointmentKind;
  appointment_fees?: number | string;
  appointmentFees?: number | string;
  appointment_duration?: number;
  slot_time?: string;
  slotTime?: string;
  schedule_date?: string;
  doctorId?: string | number;
  doctor_id?: string | number;
  patientId?: string | number;
  patient_id?: string | number;
  doctorName?: string;
  username?: string;
  fees?: number | string;
  specialty?: string;
  rate?: number;
  dimgUrl?: string;
  uimgUrl?: string;
  clinic_city?: string;
  clinic_street?: string;
  [key: string]: any;
};

export type Slot = {
  slotTime?: string;
  appointmentState?: AppointmentState;
  appointmentType?: AppointmentKind;
  appointmentFees?: number | string;
  appointmentId?: string | number;
  [key: string]: any;
};

export type SlotsData = {
  bookedSlots?: Slot[] | null;
  totalSlots?: Slot[] | null;
  freeSlots?: Slot[] | null;
  [key: string]: any;
};
