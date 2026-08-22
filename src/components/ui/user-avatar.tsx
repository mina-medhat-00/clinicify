import { Avatar } from "@/components/ui/kit";
import { Stethoscope, User } from "lucide-react";

function UserAvatar({
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

export default UserAvatar;
