import { Avatar } from "antd";
import { Link } from "react-router-dom";
import { useUtilsContext } from "@/contexts/utils-context";

const TitleHeader = ({
  icon,
  img,
  to,
  title,
  wrapperBg,
  contentBg,
  contClass = "",
}: any) => {
  const { t } = useUtilsContext();
  return to ? (
    <Link
      to={`/${to}`}
      className={`
  flex justify-center flex-col items-center gap-2
  py-3 rounded-tr-lg rounded-tl-lg ${
    wrapperBg ? wrapperBg : "bg-gray-200/50 hover:bg-gray-200"
  }`}
    >
      <div
        className={`grow w-full py-3 border-y
border-white mb-2 text-center ${contClass} ${
          contentBg ? contentBg : "bg-blue-900/80 hover:bg-blue-900"
        }`}
      >
        <h1 className="break-all text-2xl sm:text-3xl xl:text-4xl text-white text-center capitalize">
          {t(title)}
        </h1>
        {icon ? (
          icon
        ) : img ? (
          <Avatar
            src={img}
            className="w-12 h-12 sm:w-16 sm:h-16 xl:w-20 xl:h-20"
          />
        ) : null}
      </div>
    </Link>
  ) : (
    <div
      className={`
    flex justify-center flex-col items-center gap-2
    py-3 rounded-tr-lg rounded-tl-lg ${
      wrapperBg ? wrapperBg : "bg-gray-200/50"
    }`}
    >
      <div
        className={`text-xl grow w-full py-3 border-y
        border-white text-center ${contClass ? contClass : "mb-2"} ${
          contentBg ? contentBg : "bg-blue-900/80"
        }`}
      >
        <h1 className="break-all text-2xl sm:text-3xl xl:text-4xl text-white text-center capitalize">
          {t(title)}
        </h1>
        {icon ? (
          icon
        ) : img ? (
          <Avatar
            src={img}
            className="w-12 h-12 sm:w-16 sm:h-16 xl:w-20 xl:h-20"
          />
        ) : null}
      </div>
    </div>
  );
};

export default TitleHeader;
