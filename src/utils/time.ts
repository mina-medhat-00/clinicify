// Offset in ms between the zone's wall clock and UTC at one instant
function zoneOffset(ms: number, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).formatToParts(new Date(ms));
  const get = function (type: Intl.DateTimeFormatPartTypes) {
    return Number(
      parts.find(function (part) {
        return part.type === type;
      })?.value ?? 0,
    );
  };
  const wall = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
  return wall - Math.floor(ms / 1000) * 1000;
}

// A clinic wall time like "2026-11-11" + "03:30 PM" or "15:30:00" as a real instant
export function clinicDate(date: string, time: string, timeZone: string) {
  const day = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(date);
  const clock = /(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s*:?\s*(AM|PM)?/i.exec(
    time,
  );
  if (!day || !clock) return new Date(NaN);
  let hour = Number(clock[1]) % 24;
  const mode = clock[4]?.toUpperCase();
  if (mode === "PM" && hour < 12) hour += 12;
  if (mode === "AM" && hour === 12) hour = 0;
  const wall = Date.UTC(
    Number(day[1]),
    Number(day[2]) - 1,
    Number(day[3]),
    hour,
    Number(clock[2]),
    Number(clock[3] ?? 0),
  );
  // Two passes so times next to a daylight saving switch land right
  const guess = wall - zoneOffset(wall, timeZone);
  return new Date(wall - zoneOffset(guess, timeZone));
}

export function slotClock(date: string, time: string, timeZone: string) {
  return clinicDate(date, time, timeZone).toLocaleTimeString("en", {
    hour: "numeric",
    minute: "numeric",
  });
}
