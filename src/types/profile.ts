import type { Dayjs } from "dayjs";
import type { ReactNode } from "react";

// Field names the API expects for medical records
export interface MedicalValues {
  currentIssue?: string | null;
  illnessesHistory?: string | null;
  allergies?: string | null;
  immunizations?: string | null;
  surgeries?: string | null;
  testResults?: string | null;
}

export interface PersonalValues {
  nickname: string;
  gender: string;
  birth: Dayjs | null;
  address: { city: string | null; street: string | null };
  phone: string | null;
  prefix: string | null;
  email: string;
}

// Profile fields as shown with missing ones already an icon
export interface ProfileValues {
  nickname: ReactNode;
  about: ReactNode;
  specialty: ReactNode;
  age: ReactNode;
  bdate: ReactNode;
  pnumber: ReactNode;
  email: ReactNode;
  city: ReactNode;
  street: ReactNode;
  images: { img_url: string }[];
}

export type ShownField = Exclude<keyof ProfileValues, "images">;

export interface DetailsSection {
  headerColor?: string;
  propColor?: string;
  headers?: string[];
  data: { label: string; name: ShownField }[];
}

export interface ProfileRow {
  name: ReactNode;
  value?: ReactNode;
  // Shown before the value like a phone prefix
  preValue?: ReactNode;
}
