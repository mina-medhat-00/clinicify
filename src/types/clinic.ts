export type Clinic = {
  clinic_id?: string | number;
  doctor_id?: string | number;
  city?: string;
  street?: string;
  pnumber?: string;
  telephone?: string;
  prefix?: string;
  [key: string]: any;
};

export type ProfileData = {
  user?: any;
  doctor?: any;
  clinic?: Clinic | any;
  patientRecords?: any;
  [key: string]: any;
};
