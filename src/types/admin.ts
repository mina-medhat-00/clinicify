import type { UserType, Id, Verification } from "@/types/user";
import type { ReactNode, Key } from "react";

export interface ReportRow extends NamedRow {
  user_type: UserType;
  action: ReactNode;
}

export interface SidebarLink {
  key: string;
  value: string;
  icon: ReactNode;
}

export interface DoctorRow extends NamedRow {
  key: Id;
  specialty: ReactNode;
  verified: Verification;
  action: ReactNode;
}

export interface NameValue {
  nick_name: string;
  img_url?: string | null;
  user_type?: UserType;
}

export interface NamedRow {
  key: Key;
  name: NameValue;
}

// Row for the Type column filterable by account type
export interface TypedRow {
  user_type: UserType;
}

export interface UserRow extends NamedRow {
  user_type: UserType;
  gender: string;
  age: number;
  action: ReactNode;
}
