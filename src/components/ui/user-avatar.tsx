import { Avatar } from "@/components/ui/display";
import type { ComponentProps } from "react";
import { Stethoscope, User } from "lucide-react";
import type { UserType } from "@/types/user";

export default function UserAvatar({
  src,
  userType,
  size = "large",
  ...props
}: Omit<ComponentProps<typeof Avatar>, "icon"> & {
  userType?: UserType | null;
}) {
  const Icon = userType === "doctor" ? Stethoscope : User;
  return (
    <Avatar
      src={src}
      size={size}
      icon={<Icon className="size-3/5" />}
      {...props}
    />
  );
}
