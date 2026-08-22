import { Tag } from "@/components/ui";
import { CircleX, Loader2 } from "lucide-react";

export default function AccountVerify({ isVerified }: any) {
  return isVerified == null ? (
    <div className="flex p-2  text-center bg-yellow-600/60 rounded-lg flex-wrap gap-2 items-center justify-center">
      <div className="text-2xl text-yellow-100 font-medium">
        Your Account being Verified
      </div>
      <Tag
        color="gold"
        className="flex gap-2 items-center p-4 text-4xl font-medium"
      >
        pending <Loader2 className="animate-spin" />
      </Tag>
    </div>
  ) : isVerified == 0 ? (
    <div className="flex p-2 bg-red-600/60 rounded-lg flex-wrap gap-2 items-center justify-center">
      <div className="text-2xl text-red-100 font-medium">
        Your Account has been Rejected
      </div>
      <Tag
        color="red"
        className="flex gap-2 items-center p-4 text-4xl font-medium"
      >
        Rejected <CircleX />
      </Tag>
    </div>
  ) : null;
}
