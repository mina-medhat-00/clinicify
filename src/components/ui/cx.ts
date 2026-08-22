function cx(...parts: any[]) {
  return parts
    .flat(Infinity)
    .filter(function (part) {
      return typeof part === "string" && part.trim();
    })
    .join(" ");
}

function hasWidthClass(className?: string) {
  return Boolean(className && /\bw-/.test(className));
}

export { cx, hasWidthClass };
