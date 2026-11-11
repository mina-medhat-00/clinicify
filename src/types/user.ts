import type { Dispatch, SetStateAction } from "react";

export type Id = number;

export type UserType = "admin" | "doctor" | "user";

// 1 is verified and 0 is rejected while null awaits an admin
export type Verification = 0 | 1 | null;

// GET /user returns the signed-in account
export interface User {
  user_id: Id;
  user_name: string;
  nick_name: string;
  user_type: UserType;
  bdate: string;
  gender: string;
  img_url: string;
}

// Doctor columns shared across doctor lists and profiles
export interface DoctorFields {
  doctor_id: Id;
  specialty: string;
  about: string | null;
  fees: number | null;
  clinic_prefix: string | null;
  clinic_pnumber: string | null;
  clinic_tnumber: string | null;
  clinic_city: string | null;
  clinic_street: string | null;
}

// GET /doctors
export type Doctor = DoctorFields & {
  user_name: string;
  nick_name: string;
  rate: string;
  is_verified: Verification;
  img_urls: string;
};

// GET /users for admins with doctor columns filled for doctors
export type ManagedUser = Partial<DoctorFields> & {
  user_id: Id;
  user_name?: string;
  nick_name: string;
  user_type: UserType;
  bdate: string;
  gender: string;
  email: string;
  prefix: string | null;
  pnumber: string | null;
  city: string | null;
  street: string | null;
  img_url: string;
  age: number;
};

export interface AuthTokenPayload {
  exp?: number;
  iat?: number;
}

export type DoctorsHandle = SearchFilterHandle;

export interface SearchFilterValues {
  specialty: string;
  doctorName: string;
  location: string;
}

// Lets the navbar specialty menu read and set the filter
export interface SearchFilterHandle {
  doctorName: string;
  location: string;
  specialtyValue: string;
  setSearchFilter: Dispatch<SetStateAction<SearchFilterValues>>;
}
