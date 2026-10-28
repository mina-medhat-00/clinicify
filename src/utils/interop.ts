// CommonJS packages can arrive as the export itself or as a module object
// holding it under `default`, depending on how the bundler wrapped them.
export function interopDefault<T>(mod: T): T {
  const wrapped = mod as T | { default: T };
  return typeof wrapped === "object" && wrapped !== null && "default" in wrapped
    ? wrapped.default
    : wrapped;
}
