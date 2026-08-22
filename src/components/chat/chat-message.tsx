export default function Message({ isMobile, me, content, issued_time }: any) {
  return (
    <div className={me ? "pl-2" : "pr-2"}>
      <div
        className={`flex relative gap-3 flex-col w-fit rounded-bl-lg rounded-tr-lg mt-2 font-medium max-w-xl ${
          isMobile ? "min-w-48" : "min-w-32"
        } ${
          me
            ? "rounded-tl-lg ml-auto rounded-lg text-white bg-blue-500"
            : "rounded-br-lg bg-white"
        } p-2`}
      >
        <span className={`${me ? "block" : ""}`}>{content}</span>
        <span
          className={`${
            me ? "text-gray-400  block ml-auto" : "ml-auto text-gray-200"
          } text-xs`}
        >
          {issued_time}
        </span>
        <div
          className={`absolute top-0 border-8 border-x-transparent border-t-8 ${
            me ? "-left-3 border-t-white" : "-right-3 border-t-blue-500"
          }`}
        ></div>
      </div>
    </div>
  );
}
