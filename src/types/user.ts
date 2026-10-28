export type Id = number;

export type UserType = "admin" | "doctor" | "user";

// 1 = verified, 0 = rejected, null = waiting for an admin.
export type Verification = 0 | 1 | null;

// GET /user: the signed-in account.
export interface User {
  user_id: Id;
  user_name: string;
  nick_name: string;
  user_type: UserType;
  bdate: string;
  gender: string;
  img_url: string;
}

// Doctor columns shared by the doctor list, profiles and the admin list.
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

// GET /users (admin): every account, with doctor columns filled for doctors.
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
