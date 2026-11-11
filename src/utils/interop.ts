export function interopDefault<T>(mod: T): T {
  const wrapped = mod as T | { default: T };
  return typeof wrapped === "object" && wrapped !== null && "default" in wrapped
    ? wrapped.default
    : wrapped;
}
