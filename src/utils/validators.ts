import type { Dayjs } from "dayjs";
import type { Rule } from "@/components/ui/form";

const MIN_AGE = 13;

// Born at least 13 years ago (by calendar year, as the API checks).
export const minimumAgeRule: Rule = {
  message: `your age must be more than ${String(MIN_AGE)}`,
  validator(_, value) {
    const birth = value as Dayjs | null | undefined;
    if (birth && new Date().getFullYear() - birth.year() < MIN_AGE)
      throw new Error();
  },
};

export const phoneRule: Rule = {
  message: "please write phone number with 8 digits after 01x or 1x",
  pattern: /^0?(10|11|12|15)[0-9]{8,8}$/,
};

export const usernameRule: Rule = {
  pattern: /^([A-Z]|[a-z])+.{0,22}$/,
  message: "must begin with letters and max 22 characters",
};

export const passwordRule: Rule = {
  message:
    "Minimum 8 and maximum 14 characters, at least one uppercase letter, one lowercase letter",
  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,14}$/,
};
