export default function Message({
  isMobile,
  me,
  content,
  issued_time,
}: {
  isMobile?: boolean;
  // Sent by the signed-in user
  me?: boolean;
  content: string;
  issued_time?: string;
}) {
  return (
    <div className={me ? "pl-2" : "pr-2"}>
      <div
        className={`flex relative gap-3 flex-col w-fit rounded-bl-lg rounded-tr-lg mt-2 font-medium max-w-xl ${
          isMobile ? "min-w-48" : "min-w-32"
        } ${
          me
            ? "rounded-tl-lg ml-auto rounded-lg text-white bg-blue-600"
            : "rounded-br-lg bg-white"
        } p-2`}
      >
        <span className={me ? "block" : ""}>{content}</span>
        <span
          className={`${
            me ? "block ml-auto text-blue-100" : "ml-auto text-gray-500"
          } text-xs`}
        >
          {issued_time}
        </span>
        <div
          className={`absolute top-0 border-8 border-x-transparent border-t-8 ${
            me ? "-right-2 border-t-blue-600" : "-left-2 border-t-white"
          }`}
        ></div>
      </div>
    </div>
  );
}
