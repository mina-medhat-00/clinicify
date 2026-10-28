import type { Dispatch, SetStateAction } from "react";

// What the profile page's side drawer shows.
export interface ProfileDrawer {
  isOpen: boolean;
  type: "" | "rate" | "medical" | "personal" | "clinic";
  name: string;
  className: string;
}

export type SetProfileDrawer = Dispatch<SetStateAction<ProfileDrawer>>;
