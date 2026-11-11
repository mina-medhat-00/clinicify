import type { Dayjs } from "dayjs";
import type { UploadFile } from "@/types/ui";

export interface LoginValues {
  username: string;
  password: string;
  remember?: boolean;
}

export interface ValidState {
  invalidUser: boolean;
  invalidPass: boolean;
}

export interface SignupValues {
  nickname: string;
  username: string;
  password: string;
  confirm: string;
  gender: string;
  birth: Dayjs | null;
  address: { city: string; street: string };
  prefix: string;
  phone: string;
  email: string;
  images?: UploadFile[];
  userType: "user" | "doctor";
  // Doctors only
  specialty?: string;
  currentHospital?: string;
  graduationYear?: number | null;
  experienceYears?: number | null;
  fees?: number | null;
  salary?: number | null;
  about?: string;
  achievement?: string;
  // Doctor opened the optional fields
  moreInf?: boolean;
}

// error1 means the server could not be reached
export type UsernameState = "" | "validating" | "success" | "error" | "error1";
