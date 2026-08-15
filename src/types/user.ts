export type UserType = "admin" | "doctor" | "patient" | string;

export type User = {
  user_id?: string | number;
  username?: string;
  nick_name?: string;
  user_type?: UserType;
  email?: string;
  img_url?: string;
  img_urls?: any;
  prefix?: string;
  pnumber?: string;
  city?: string;
  street?: string;
  age?: number | string;
  bdate?: string;
  gender?: string;
  about?: string;
  specialty?: string;
  rate?: number;
  num_rate?: number;
  is_verified?: boolean | number;
  [key: string]: any;
};

export type AuthTokenPayload = {
  exp?: number;
  iat?: number;
  user_id?: string | number;
  [key: string]: any;
};
