export type ClassValue = string | false | null | undefined | 0 | ClassValue[];

function collect(parts: ClassValue[], into: string[]) {
  for (const part of parts) {
    if (Array.isArray(part)) collect(part, into);
    else if (typeof part === "string" && part.trim()) into.push(part);
  }
  return into;
}

function cx(...parts: ClassValue[]) {
  return collect(parts, []).join(" ");
}

function hasWidthClass(className?: string) {
  return Boolean(className && /\bw-/.test(className));
}

export { cx, hasWidthClass };
