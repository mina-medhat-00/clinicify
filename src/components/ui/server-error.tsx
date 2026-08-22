import { Result } from "@/components/ui";
import { Link } from "react-router-dom";

export default function ServerError({ extra, status, statusTitle }: any) {
  return (
    <Result
      className="m-auto"
      status={status || "500"}
      title={statusTitle || "500"}
      subTitle={
        <span className="font-medium text-2xl text-gray-700">
          Sorry, something went wrong
        </span>
      }
      extra={extra ? <Link to="/">Back Home</Link> : null}
    />
  );
}
