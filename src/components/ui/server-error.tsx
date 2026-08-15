import { Result } from "antd";
import { Link } from "react-router-dom";

const ServerError = ({ extra, status, statusTitle }: any) => {
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
};

export default ServerError;
