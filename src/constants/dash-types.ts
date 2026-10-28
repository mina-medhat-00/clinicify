export const doctorDashTypes = [
  "profile",
  "schedule",
  "appointments",
  "chat",
  "statistics",
] as const;
export type DoctorDashType = (typeof doctorDashTypes)[number];

export const adminDashTypes = [
  "profile",
  "doctor",
  "user",
  "chat",
  "reports",
] as const;
export type AdminDashType = (typeof adminDashTypes)[number];
