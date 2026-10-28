// A slot's start ("YYYY-MM-DD" + "hh:mm AM" in the clinic's time zone) as
// a local clock time, e.g. "3:00 PM".
export function slotClock(date: string, time: string, timeZone: string) {
  return new Date(`${date} ${time} ${timeZone}`).toLocaleTimeString("en", {
    hour: "numeric",
    minute: "numeric",
  });
}
