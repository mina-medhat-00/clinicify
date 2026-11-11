import type { DoctorFields, Id, UserType, Verification } from "@/types/user";
import type { ReactNode } from "react";

export type Clinic = Pick<
  DoctorFields,
  | "clinic_prefix"
  | "clinic_pnumber"
  | "clinic_tnumber"
  | "clinic_city"
  | "clinic_street"
>;

export interface ProfileUser {
  user_id: Id;
  nick_name: string;
  user_type: UserType;
  bdate: string;
  gender: string;
  prefix: string | null;
  pnumber: string | null;
  email: string;
  city: string | null;
  street: string | null;
  age: number;
  img_urls: { img_url: string }[];
}

export type ProfileDoctor = DoctorFields & {
  is_verified: Verification;
  rate: number;
  num_rate: number;
};

export interface PatientRecords {
  current_issue: string | null;
  illnesses_history: string | null;
  allergies: string | null;
  surgeries: string | null;
  immunizations: string | null;
  test_results: string | null;
}

// GET /profile/{username}
export interface ProfileData {
  user: ProfileUser;
  doctor?: ProfileDoctor;
  patientRecords?: PatientRecords;
}

export interface ClinicSection {
  headerColor?: string;
  propColor?: string;
  headers: ReactNode[];
  data: { label: string; name: keyof Clinic; preValue?: keyof Clinic }[];
  icon?: ReactNode;
}

// Saved values may have empty columns that the form fills in
export interface ClinicInitialValues {
  address: { city?: string | null; street?: string | null };
  phone?: string | null;
  telephone?: string | null;
  prefix?: string | null;
}

export interface ClinicValues {
  address: { city: string; street: string };
  phone: string;
  telephone?: string;
  prefix: string;
}
