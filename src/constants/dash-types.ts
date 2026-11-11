import "@/types/dashboard";

export const doctorDashTypes = [
  "profile",
  "schedule",
  "appointments",
  "chat",
  "statistics",
] as const;
export const adminDashTypes = [
  "profile",
  "doctor",
  "user",
  "chat",
  "reports",
] as const;
