import { Result } from "@/components/ui";
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
}: any) {
  return (
    <Result
      className="m-auto"
      status={status || "500"}
      title={statusTitle || statusTitles[String(status || "500")]}
      subTitle={
        <span className="font-medium text-2xl text-gray-700">
          {message ||
            (errorTitle
              ? `Sorry, cannot load ${errorTitle} right now`
              : "Sorry, something went wrong")}
        </span>
      }
      extra={extra ? <Link to="/">Back Home</Link> : null}
    />
  );
}
