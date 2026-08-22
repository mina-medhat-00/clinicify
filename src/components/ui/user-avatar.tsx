import { Avatar } from "@/components/ui";
import { Stethoscope, User } from "lucide-react";

export default function UserAvatar({
  src,
  userType,
  size = "large",
  className,
  ...props
}: any) {
  const Icon = userType === "doctor" ? Stethoscope : User;
  return (
    <Avatar
      src={src || undefined}
      size={size}
      className={className}
      icon={<Icon className="size-3/5" />}
      {...props}
    />
  );
}
