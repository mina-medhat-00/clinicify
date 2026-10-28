import type { DoctorFields, Id, UserType, Verification } from "@/types/user";

// The clinic columns as the admin and profile pages show them.
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
