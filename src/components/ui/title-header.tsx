import { Link } from "react-router-dom";

function TitleHeader({
  icon,
  to,
  title,
  wrapperBg,
  contentBg,
  contClass = "",
}: any) {
  const body = (
    <div
      className={`grow w-full py-3 border-y border-white text-center ${
        contClass ? contClass : "mb-2"
      } ${contentBg ? contentBg : "bg-blue-900/80 hover:bg-blue-900"}`}
    >
      <h1 className="break-all text-2xl sm:text-3xl xl:text-4xl text-white text-center capitalize">
        {title}
      </h1>
      {icon || null}
    </div>
  );

  if (to) {
    return (
      <Link
        to={`/${to}`}
        className={`flex justify-center flex-col items-center gap-2 py-3 rounded-tr-lg rounded-tl-lg ${
          wrapperBg ? wrapperBg : "bg-gray-200/50 hover:bg-gray-200"
        }`}
      >
        {body}
      </Link>
    );
  }

  return (
    <div
      className={`flex justify-center flex-col items-center gap-2 py-3 rounded-tr-lg rounded-tl-lg ${
        wrapperBg ? wrapperBg : "bg-gray-200/50"
      }`}
    >
      {body}
    </div>
  );
}

export default TitleHeader;
