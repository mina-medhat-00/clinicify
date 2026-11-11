import { twMerge } from "tailwind-merge";
import type { ClassValue } from "@/types/ui";

function collect(parts: ClassValue[], into: string[]) {
  for (const part of parts) {
    if (Array.isArray(part)) collect(part, into);
    else if (typeof part === "string" && part.trim()) into.push(part);
  }
  return into;
}

// Later classes win over earlier conflicting ones so callers can override defaults
function cx(...parts: ClassValue[]) {
  return twMerge(collect(parts, []).join(" "));
}

function hasWidthClass(className?: string) {
  return Boolean(className && /\bw-/.test(className));
}

export { cx, hasWidthClass };
