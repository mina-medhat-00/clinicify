import { Hospital, Loader2, MessageSquareText } from "lucide-react";

function adjustTime(date?: any, time?: any, timeZone?: any, ..._args: any[]) {
  return new Date(`${date} ${time} ${timeZone}`).toLocaleTimeString("en", {
    hour: "numeric",
    minute: "numeric",
  });
}
function BookButton({
  appointmentType,
  appointmentFees,
  appointmentState,
  slotTime,
  schedule_date,
  timeZone,
}: any) {
  return (
    <div>
      <div className="flex flex-wrap justify-between gap-2">
        <div className={`flex gap-2 bg-gray-400/40 p-2 rounded-lg`}>
          <Loader2 className="flex items-center text-yellow-200 text-2xl animate-spin" />
          ,
          <span className="text-white font-medium">
            {appointmentState?.toUpperCase()}
          </span>
        </div>
        <div className={`flex gap-2 bg-gray-600/40 p-2 rounded-lg`}>
          {appointmentType == "inClinic" ? (
            <Hospital className="flex items-center text-gray-200 text-xl" />
          ) : appointmentType == "chat" ? (
            <MessageSquareText className="flex items-center text-gray-200 text-xl" />
          ) : null}
          <span className="text-white font-medium">
            {appointmentType?.toUpperCase()}
          </span>
        </div>
        <div className={`flex gap-2 bg-gray-400/40 p-2 rounded-lg`}>
          <span className="text-white font-medium">{appointmentFees} L.E</span>
        </div>
      </div>
      <hr className="w-full my-2" />
      <div className="w-full text-center">
        <span className="text-white font-medium">
          {adjustTime(schedule_date, slotTime, timeZone)}
        </span>
      </div>
    </div>
  );
}

export default BookButton;
