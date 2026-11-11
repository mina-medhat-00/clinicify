export function slotClock(date: string, time: string, timeZone: string) {
  return new Date(`${date} ${time} ${timeZone}`).toLocaleTimeString("en", {
    hour: "numeric",
    minute: "numeric",
  });
}
