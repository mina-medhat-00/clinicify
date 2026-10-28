import { Result } from "@/components/ui/display";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const statusTitles: Record<string, string> = {
  "403": "Forbidden",
  "404": "Page Not Found",
  "500": "Server Error",
};

export default function ServerError({
  extra,
  status,
  statusTitle,
  message,
  errorTitle,
}: {
  extra?: boolean;
  status?: number | string;
  statusTitle?: ReactNode;
  message?: ReactNode;
  // What failed to load, e.g. "doctors".
  errorTitle?: string;
}) {
  const code = String(status ?? "500");
  return (
    <Result
      className="m-auto"
      status={code}
      title={statusTitle ?? statusTitles[code]}
      subTitle={
        <span className="font-medium text-2xl text-gray-700">
          {message ??
            (errorTitle
              ? `Sorry, cannot load ${errorTitle} right now`
              : "Sorry, something went wrong")}
        </span>
      }
      extra={extra ? <Link to="/">Back Home</Link> : null}
    />
  );
}
