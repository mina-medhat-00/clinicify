import type { adminDashTypes, doctorDashTypes } from "@/constants/dash-types";

export type DoctorDashType = (typeof doctorDashTypes)[number];

export type AdminDashType = (typeof adminDashTypes)[number];
